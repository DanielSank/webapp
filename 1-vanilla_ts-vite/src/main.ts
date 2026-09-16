import { addItem, deleteItem, addCallbackToTodos, reorderTodos, setChecked } from "./todo.js"
import { render } from "./render.js"

addCallbackToTodos(render);

const button = document.getElementById("myButton");
if (button) {
    button.addEventListener("click", addItem);
}

function getRowId(target: EventTarget | null): number {
    if (!(target instanceof Element)) { throw new Error("Target isn't an element") }
    const row = target.closest("li");
    if (row === null) { throw new Error("Didn't find a row") }
    const id = row.dataset.id;
    if (id === undefined) { throw new Error("row doesn't have an id") }
    return Number(id);
}

let list = document.getElementById("list");
if (list === null) {
    throw new Error("List not found");
}

list.addEventListener("dragstart", (event: DragEvent) => {
    console.log(event.target, event.target?.constructor.name);
    const rowId = getRowId(event.target);
    if (event.dataTransfer === null) {throw new Error("dataTransfer not available");}
    event.dataTransfer.setData("text/plain", `${rowId}`);
});

list.addEventListener("drop", (event: DragEvent) => {
    if (event.dataTransfer === null) {throw new Error("dataTransfer not available");}
    const draggedId = Number(event.dataTransfer.getData("text/plain"));
    const droppedId = getRowId(event.target);
    reorderTodos(draggedId, Number(droppedId));
});

list.addEventListener("dragover", (event: DragEvent) => {event.preventDefault();});

list.addEventListener("click", (event: MouseEvent) => {
    if (event.target instanceof Element && event.target.closest("button") !== null) {
        const id = getRowId(event.target);
        deleteItem(id);
    }
});

list.addEventListener("change", (event: Event) => {
    if (event.target instanceof HTMLInputElement && event.target.type === "checkbox") {
        const id = getRowId(event.target);
        setChecked(id, event.target.checked);
    }
});


window.addEventListener("DOMContentLoaded", (_event) => {render()});


