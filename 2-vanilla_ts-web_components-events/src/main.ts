import { TodoItemElement } from "./todo-item.js";
import { TodoListElement } from "./todo-list.js";
import { getTodosReadonly, addItem, deleteItem, setChecked, reorderTodos, addCallbackToTodos } from "./todo.js";


const todoListElement = document.getElementById("list") as TodoListElement;
if (todoListElement === null) { throw new Error("no list"); }

const button = document.getElementById("myButton");
if (button === null) { throw new Error("no button") }
const input = document.getElementById("input") as HTMLInputElement;
if (input === null) { throw new Error("no input") }
button.addEventListener("click", () => {
    addItem(input.value);
    input.value = "";
});

todoListElement.addEventListener("todo-toggled", (event: Event) => {
    const { id, checked} = (event as CustomEvent).detail;
    setChecked(id, checked);
});

todoListElement.addEventListener("todo-delete-requested", (event: Event) => {
    const { id } = (event as CustomEvent).detail;
    deleteItem(id);

});

todoListElement.addEventListener("drop", (event: DragEvent) => {
    if (event.dataTransfer === null) {throw new Error("dataTransfer not available");}
    const draggedId = Number(event.dataTransfer.getData("text/plain"));
    const target = event.target
    if (!(target instanceof Element)) { throw new Error("Target should have been an element, but isn't."); }
    const item = target.closest("todo-item");
    if (item instanceof TodoItemElement) {
        reorderTodos(draggedId, item.todoId);
    } else {
        console.log("Drop target isn't inside a todo-item.");
    }
});

window.addEventListener("DOMContentLoaded", (_event) => {
    addCallbackToTodos(() => todoListElement.setTodos(getTodosReadonly()));
    todoListElement.setTodos(getTodosReadonly());
});

