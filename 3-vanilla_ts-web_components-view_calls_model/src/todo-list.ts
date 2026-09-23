import { TodoItemElement } from "./todo-item.js";
import type { TodoItem } from "./todo.js";

function getRowId(target: EventTarget | null): number {
    if (!(target instanceof Element)) { throw new Error("target isn't an element") }
    const row = target.closest("todo-item");
    if (row === null) { throw new Error("Didn't find a TodoItemElement") }
    const id = (row as TodoItemElement).todoId;
    if (id === undefined) { throw new Error("TodoItemElement doesn't have an id") }
    return Number(id);
}

export class TodoListElement extends HTMLElement {

    public deleteItem: (id: number) => void = () => { throw new Error("TodoListElement.deleteItem not configured.") };
    public toggle: (id: number, checked: boolean) => void = () => { throw new Error("TodoListElement.toggle not configured.") };
    public reorderItems: (dragged: number, dropped: number) => void = () => { throw new Error("TodoListElement.reorderItems not configured.") };
    // Set these to business logic functions.

    constructor() {
        super();
        this.addEventListener(
            "todo-delete-requested",
            (event: Event) => {
                const { id } = (event as CustomEvent).detail;
                this.deleteItem(id);
            }
        );
        this.addEventListener(
            "todo-toggled",
            (event: Event) => {
                const { id, checked } = (event as CustomEvent).detail;
                this.toggle(id, checked);
            }
        );
        this.addEventListener("dragstart", (event: DragEvent) => {
            const rowId = getRowId(event.target);
            if (event.dataTransfer === null) {throw new Error("dataTransfer not available");}
            event.dataTransfer.setData("text/plain", `${rowId}`);
        });

        this.addEventListener("drop", (event: DragEvent) => {
            if (event.dataTransfer === null) {throw new Error("dataTransfer not available");}
            const draggedId = Number(event.dataTransfer.getData("text/plain"));
            const droppedId = getRowId(event.target);
            this.reorderItems(draggedId, Number(droppedId));
        });

        this.addEventListener("dragover", (event: DragEvent) => { event.preventDefault(); });
    }

    // Methods that should observe business logic.
    public addTodoItem(item: TodoItem): void {
        const el = document.createElement("todo-item") as TodoItemElement;
        this.appendChild(el);
        el.todoId = item.id;
        el.text = item.text;
        el.checked = item.checked;
    }

    public deleteTodoItem(id: number): void {
        const el = Array.from(this.children).find((child) => {
            if (!(child instanceof TodoItemElement)) {
                throw new Error("TodoListElement has a child that isn't a TodoItemElement.");
            }
            return child.todoId === id
        });
        if (el === undefined) { throw new Error("Couldn't delete item with that ID") }
        el.remove();
    }

    public reorderTodoItems(dragged: number, dropped: number): void {
        const children = Array.from(this.children);
        const draggedItem = children.find(c => (c as TodoItemElement).todoId === dragged);
        const droppedItem = children.find(c => (c as TodoItemElement).todoId === dropped);
        if (draggedItem === undefined || droppedItem === undefined) {
            throw new Error("Could not find elements to reorder them.");
        }
        const draggedIdx = children.indexOf(draggedItem);
        const droppedIdx = children.indexOf(droppedItem);
        if (draggedIdx < droppedIdx) {
            this.insertBefore(draggedItem, droppedItem.nextSibling);
        } else {
            this.insertBefore(draggedItem, droppedItem);
        }
    }
    // end methods that should observe business logic.

    public render(items: readonly TodoItem[]): void {
        this.replaceChildren();
        for (const item of items) {
            this.addTodoItem(item);
        }
    }
}

customElements.define("todo-list", TodoListElement);
