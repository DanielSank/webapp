import { TodoItemElement } from "./todo-item.js";
import type { TodoItem } from "./todo.js";

export class TodoListElement extends HTMLElement {

    constructor() {
        super();
    }

    public setTodos(items: TodoItem[]): void {
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
