export class TodoItemElement extends HTMLElement {

    private checkbox: HTMLInputElement;
    private textbox: HTMLSpanElement;
    private deleteButton: HTMLButtonElement;
    todoId!: number;

    constructor() {
        super();

        this.checkbox = document.createElement("input");
        this.checkbox.type = "checkbox";
        this.checkbox.addEventListener("change", () => {
            this.dispatchEvent(new CustomEvent("todo-toggled", {
                detail: { checked: this.checkbox.checked, id: this.todoId },
                bubbles: true,
            }));
        });

        this.textbox = document.createElement("span");

        this.deleteButton = document.createElement("button");
        this.deleteButton.textContent = "delete";
        this.deleteButton.addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("todo-delete-requested", {
                detail: { id: this.todoId },
                bubbles: true,
            }));
        });
    }

    connectedCallback(): void {
        if (this.hasChildNodes()) return;
        this.appendChild(this.checkbox);
        this.appendChild(this.textbox);
        this.appendChild(this.deleteButton);
    }

    get checked(): boolean { return this.checkbox.checked; }

    set checked(value: boolean) { this.checkbox.checked = value; }

    get text(): string { return this.textbox.textContent; }

    set text(value: string) { this.textbox.textContent = value; }
}

customElements.define("todo-item", TodoItemElement);
