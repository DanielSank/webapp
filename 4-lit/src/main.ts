import { Combobox } from './my-combobox.ts';
import { TodoListElement } from "./todo-list.ts";
import { addItem } from "./todo.ts";

const todoListElement = document.getElementById("todoList") as TodoListElement;
if (todoListElement === null) { throw new Error("no list"); }

const todoTextInput = document.getElementById("todo-text") as HTMLInputElement;
if (todoTextInput === null) { throw new Error("Input not found"); }

const button = document.getElementById("myButton");
if (button === null) { throw new Error("no button") };
button.addEventListener("click", () => addItem(todoTextInput.value));

const cbox = document.getElementById("cbox") as Combobox;
if (cbox === null) { throw new Error("no cbox") };
cbox.options = [
    { label: "foo", value: "best" },
    { label: "bar", value: "always second" },
];
