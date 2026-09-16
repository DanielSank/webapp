In this variant, we use web components, but communication between data and UI goes through callback functions instead of events.
To run:

```
$ npm install
$ npx tsc
$ python3 -m http.server 8000
```

Consider what happens if someone clicks the delete button.
The `TodoItemElement` that owns the button dispatches a custom event `todo-delete-requested`.
This event bubbles up to the parent UI element, which is a `TodoListElement`.
Upon receiving the event, the parent element calls its own `deleteItem` method.
That method is a parameter which is meant to be set by whatever business logic instances the element.
In other words, when we construct a `TodoListElement`, we're supposed to supply it a function that it can call when the user wants to delete an item.
That function is meant to be aware of the business logic, i.e. it's the intended entry point for UI to tell the business logic "something needs to be deleted now".

`TodoListElement` also has a public method `render` which is meant to be called by the business logic whenever a render is required.
`main.ts` attaches this `render` method as a callback whenever the business logic todo list is mutated, i.e. as a trap on `set`.
