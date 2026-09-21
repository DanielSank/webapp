import { TodoItemElement } from "./todo-item.js";
import type { TodoItem } from "./todo.js";

export class TodoListElement extends HTMLElement {

    public deleteItem: (id: number) => void = () => { throw new Error("TodoListElement.deleteItem not configured.") };
    public toggle: (id: number, checked: boolean) => void = () => { throw new Error("TodoListElement.toggle not configured.") };
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
        const el = Array.from(this.children).find (
            (child) => (child as TodoItemElement).todoId === id
        );
        if (el === undefined) { throw new Error("Couldn't delete item with that ID") }
        el.remove();
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
