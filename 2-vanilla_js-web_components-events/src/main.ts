import { TodoListElement } from "./todo-list.js";
import { todoList, addItem, deleteItem, setChecked, addCallbackToTodos } from "./todo.js";


const todoListElement = document.getElementById("list") as TodoListElement;
    if (todoListElement === null) { throw new Error("no list"); }

const button = document.getElementById("myButton");
if (button === null) { throw new Error("no button") };
button.addEventListener("click", addItem);

todoListElement.addEventListener("todo-toggled", (event: Event) => {
    const { id, checked} = (event as CustomEvent).detail;
    setChecked(id, checked);
});

todoListElement.addEventListener("todo-delete-requested", (event: Event) => {
    const { id } = (event as CustomEvent).detail;
    deleteItem(id);

});

window.addEventListener("DOMContentLoaded", (_event) => {
    addCallbackToTodos(() => todoListElement.setTodos(todoList));
    todoListElement.setTodos(todoList);
});
