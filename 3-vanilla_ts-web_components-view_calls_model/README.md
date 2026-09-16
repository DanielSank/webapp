In this variant, we use web components.
There's a component representing the todo list, `TodoListElement`, and another component representing a single todo item, `TodoItemElement`.
There's one instance of `TodoListElement` in the page, and it's fetched in `main.ts` as `todoListElement`.

Consider what happens if someone clicks the delete button.
The `TodoItemElement` that owns the button dispatches a custom event `todo-delete-requested`.
In `main.ts`, we add an event listener that catches that event when the event bubbles up to `listElement` and calls `deleteItem`.
`deleteItem` mutates `todoList`.
But `todoList` is a proxy allowing that traps the `set` method, and `main.ts` attaches `listElement.setTodos` as a callback.

In other words, the flow is:
1. User action on UI -> UI dispatches event
1. Parant UI catches event and calls business function.
1. Business function mutates data.
1. Data has been instrumented such that upon mutation, it tells the UI to render.

This is kind of insane but it has the benefit that neither the business logic nor the UI knows about the other.
UI elements just emit events and business logic just gets mutated; `main.ts` sets up all the hooks to turn UI events into business logic actions and to turn business logic changes into UI actions.
