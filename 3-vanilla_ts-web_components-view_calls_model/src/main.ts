import { TodoListElement } from "./todo-list.js";
import { todoList, addItem, deleteItem, setChecked, addCallbackToTodos } from "./todo.js";


const todoListElement = document.getElementById("todoList") as TodoListElement;
if (todoListElement === null) { throw new Error("no list"); }
todoListElement.deleteItem = deleteItem;
todoListElement.toggle = setChecked;

const button = document.getElementById("myButton");
if (button === null) { throw new Error("no button") };
button.addEventListener("click", addItem);

window.addEventListener("DOMContentLoaded", (_event) => {
    addCallbackToTodos(() => todoListElement.setTodos(todoList));
    todoListElement.setTodos(todoList);
});
