In this variant, we use web components, but communication between data and UI goes through callback functions instead of events.
To run:

```
$ npm install
$ npx tsc
$ python3 -m http.server 8000
```

Consider what happens when the delete button is clicked.

1. The `TodoItemElement` that owns the button dispatches a custom event `todo-delete-requested`.
1. This event bubbles up to the parent UI element, which is a `TodoListElement`. Upon receiving the event, the `TodoListElement`, calls its `deleteItem` method.
1. That method is initialized to throw an error. However...
1. `main.ts` sets that `todoListElement.deleteItem` to the business logic function `deleteItem` that deletes a todo item. At this point, the flow from controller -> model is complete.

What about going from model -> view?
1. The business logic function `deleteItem` is wrapped to be observable.
1. `main.ts` signs up `todoListElement.deleteTodoItem` to observe the business logic `deleteItem`. That way, the UI gets a call back whenever the business logic deletes an item.
