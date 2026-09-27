import { useSyncExternalStore, useState } from 'react';
import { getTodoListReadonly, addItem, deleteItem, setChecked, reorderTodos } from './todo.ts';
import type { TodoItem } from './todo.ts'


// What is going on here:
// useSyncExternalStore has to have the property that calling
// getSnapshot twice in a row, without any change to the store,
// returns exactly the same object. But we also need getSnapshot
// to return a new object when the store changes. To do that,
// we have getSnapshot return the cached value, and we update that
// value precisely when we know the store has changed, i.e.
// because addItem and co. have been called.

let cachedSnapshot: readonly TodoItem[] = getTodoListReadonly();

function getSnapshot(): readonly TodoItem[] {
    return cachedSnapshot;
}

function subscribe(observer: () => void): () => void {
    const callback = () => {
        cachedSnapshot = [...getTodoListReadonly()];
        observer();
    };
    const id_add = addItem.addObserver(callback);
    const id_delete = deleteItem.addObserver(callback);
    const id_checked = setChecked.addObserver(callback);
    const id_reorder = reorderTodos.addObserver(callback);
    return () => {
        addItem.removeObserver(id_add);
        deleteItem.removeObserver(id_delete);
        setChecked.removeObserver(id_checked);
        reorderTodos.removeObserver(id_reorder);
    };
}

function App() {
    const todoList = useSyncExternalStore(subscribe, getSnapshot);
    return (
        <>
            <AddButtonElement/>
            <TodoListElement todos={todoList} />
        </>
    )
}

export default App

function AddButtonElement() {
    const [text, setText] = useState("");
    return (
        <>
            <button onClick={() => {addItem(text); setText(""); }}>Add</button>
            <input type="text" value={text} onChange={(e) => setText(e.target.value)}></input>
        </>
    );
}

function TodoListElement({ todos }: { todos: readonly TodoItem[]}) {
    return todos.map((todo) => (
            <TodoItemElement key={todo.id} text={todo.text} checked={todo.checked} id={todo.id}/>
    ));
}

function TodoItemElement({ text, checked, id }: {text:string, checked: boolean, id: number}) {
    return (
        <li
            draggable
            onDragStart={ (e) => { e.dataTransfer.setData("text/plain", String(id));} }
            onDragOver={ (e) => {e.preventDefault();} }
            onDrop={ (e) => {
                const draggedId = Number(e.dataTransfer.getData("text/plain"));
                reorderTodos(draggedId, id);
            }}
            >
            <input type="checkbox" checked={checked} onChange={(e) => setChecked(id, e.target.checked)}></input>
            <span>{text}</span>
            <button onClick={() => deleteItem(id)}>delete</button>
        </li>
    )
}
