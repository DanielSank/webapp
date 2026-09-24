import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'
import { getTodoListReadonly, addItem, deleteItem, setChecked, reorderTodos } from './todo.ts'


function getRowId(path: EventTarget[]): number {
    const row = path.find((node): node is TodoItemElement => node instanceof TodoItemElement);
    if (row === undefined) { throw new Error("Didn't find a TodoItemElement") }
    return row.todoId;
}

@customElement('todo-list')
export class TodoListElement extends LitElement {

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
            reorderTodos(draggedId, Number(droppedId));
        });
        // React to business logic functions
        addItem.addObserver(() => this.requestUpdate());
        deleteItem.addObserver(() => this.requestUpdate());
        setChecked.addObserver(() => this.requestUpdate());
        reorderTodos.addObserver(() => this.requestUpdate());
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
