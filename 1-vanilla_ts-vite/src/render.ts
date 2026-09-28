import { getTodosReadonly} from "./todo.js"

export function render() {
    console.log("rendering");
    let list = document.getElementById("list");
    if (list === null) {
        throw new Error("List not found");
    }
    list.replaceChildren();

    for (const item of getTodosReadonly()) {

        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = item.checked;

        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";

        let itemHTML = document.createElement("li");
        itemHTML.dataset.id = String(item.id);
        itemHTML.appendChild(checkbox);
        itemHTML.appendChild(document.createTextNode(item.text));
        itemHTML.appendChild(deleteButton);
        itemHTML.draggable = true;


        list.appendChild(itemHTML);
    }

}
