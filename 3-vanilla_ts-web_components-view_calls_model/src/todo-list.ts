import { TodoItemElement } from "./todo-item.js";
import type { TodoItem } from "./todo.js";

export class TodoListElement extends HTMLElement {

    public deleteItem?: (id: number) => void;
    public toggle?: (id: number, checked: boolean) => void;

    constructor() {
        super();
    }

    connectedCallback(): void {
        this.addEventListener(
            "todo-delete-requested",
            (event: Event) => {
                const { id } = (event as CustomEvent).detail;
                this.deleteItem!(id);
            }
        );
        this.addEventListener(
            "todo-toggled",
            (event: Event) => {
                const { id, checked } = (event as CustomEvent).detail;
                this.toggle!(id, checked);
            }
        );
    }

    public render(items: TodoItem[]): void {
        this.replaceChildren();
        for (const item of items) {
            const el = document.createElement("todo-item") as TodoItemElement;
            this.appendChild(el);
            el.todoId = item.id;
            el.text = item.text;
            el.checked = item.checked;
        }
    }
}

customElements.define("todo-list", TodoListElement);
