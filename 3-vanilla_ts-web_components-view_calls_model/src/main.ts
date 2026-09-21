import { TodoListElement } from "./todo-list.js";
import { getTodoListReadonly, addItem, deleteItem, setChecked } from "./todo.js";


const todoListElement = document.getElementById("todoList") as TodoListElement;
if (todoListElement === null) { throw new Error("no list"); }

const todoTextInput = document.getElementById("todo-text") as HTMLInputElement;
if (todoTextInput === null) { throw new Error("Input not found"); }

// Give TodoListElement handles to business logic
todoListElement.deleteItem = deleteItem;
todoListElement.toggle = setChecked;

// Subscribe TodoListElement to business logic actions.
deleteItem.addObserver((_, id) => todoListElement.deleteTodoItem(id));

const button = document.getElementById("myButton");
if (button === null) { throw new Error("no button") };
button.addEventListener("click", () => addItem(todoTextInput.value));
addItem.addObserver((item) => todoListElement.addTodoItem(item));

window.addEventListener("DOMContentLoaded", (_event) => {
    todoListElement.render(getTodoListReadonly());
});
