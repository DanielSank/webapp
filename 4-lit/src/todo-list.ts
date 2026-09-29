import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'
import { getTodoListReadonly, addItem, deleteItem, setChecked, reorderTodos } from './todo.ts'

function getRowId(path: EventTarget[]): number {
    const row = path.find((node): node is TodoItemElement => node instanceof TodoItemElement);
    if (row === undefined) { throw new Error("Didn't find a TodoItemElement") }
    return row.todoId;
}

@customElement('todo-input')
export class TodoInputElement extends LitElement {
    @state()
    private text = "";

    private onClick() {
        addItem(this.text);
        this.text = "";
    }

    private handleInput(event: Event) {
        this.text = (event.target as HTMLInputElement).value;
    }

    render() {
        return html`
        <button @click=${this.onClick}>Add</button>
        <input
            type="text"
            @input=${this.handleInput}
            .value=${this.text}
        >
        </input>
        `
    }
}

@customElement('todo-list')
export class TodoListElement extends LitElement {

    private disconnectors: (() => void)[] = [];

    constructor() {
        super();
        // Handles to business logic
        this.addEventListener("todo-delete-requested", (event: Event) => {
            const { id } = (event as CustomEvent).detail;
            deleteItem(id);
        });
        this.addEventListener("todo-toggled", (event: Event) => {
            const { id, checked } = (event as CustomEvent).detail;
            setChecked(id, checked);
        });
        this.addEventListener("dragstart", (event: DragEvent) => {
            const rowId = getRowId(event.composedPath());
            if (event.dataTransfer === null) {throw new Error("dataTransfer not available");}
            event.dataTransfer.setData("text/plain", `${rowId}`);
        });

        this.addEventListener("drop", (event: DragEvent) => {
            if (event.dataTransfer === null) {throw new Error("dataTransfer not available");}
            const draggedId = Number(event.dataTransfer.getData("text/plain"));
            const droppedId = getRowId(event.composedPath());
            reorderTodos(draggedId, droppedId);
        });

        // React to business logic functions
        const addItemId = addItem.addObserver(() => this.requestUpdate());
        const deleteItemId = deleteItem.addObserver(() => this.requestUpdate());
        const setCheckedId = setChecked.addObserver(() => this.requestUpdate());
        const reorderTodosId = reorderTodos.addObserver(() => this.requestUpdate());

        // Set up unsubscribe
        this.disconnectors.push(() => { addItem.removeObserver(addItemId) });
        this.disconnectors.push(() => { deleteItem.removeObserver(deleteItemId) });
        this.disconnectors.push(() => { setChecked.removeObserver(setCheckedId) });
        this.disconnectors.push(() => { reorderTodos.removeObserver(reorderTodosId) });
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        for (const disconnect of this.disconnectors) { disconnect(); }
    }

    render() {
        return html`
            <ul>
                ${repeat(
                    getTodoListReadonly(), (item) => item.id, (item) => html`
                    <todo-item .todoId=${item.id} .text=${item.text} .checked=${item.checked}></todo-item>
                `)}
            </ul>
        `;
    }
}

@customElement('todo-item')
export class TodoItemElement extends LitElement {
    @property({ type: Number }) todoId!: number;
    @property({ type: String }) text = '';
    @property({ type: Boolean }) checked = false;

    connectedCallback(): void {
        super.connectedCallback();
        this.draggable = true;
        this.addEventListener("dragover", (event: DragEvent) => { event.preventDefault(); });
    }

    private _onToggle(event: Event): void {
        const checked = (event.target as HTMLInputElement).checked;
        this.dispatchEvent(new CustomEvent("todo-toggled", {
            detail: { checked, id: this.todoId },
            bubbles: true,
            composed: true,
        }));
    }

    private _onDelete(): void {
        this.dispatchEvent(new CustomEvent("todo-delete-requested", {
            detail: { id: this.todoId },
            bubbles: true,
            composed: true,
        }));
    }

    render() {
        return html`
        <li>
            <input type="checkbox" .checked=${this.checked} @change=${this._onToggle}></input>
            <span>${this.text}</span>
            <button @click=${this._onDelete}>delete</button>
        </li>
        `
    }
}
