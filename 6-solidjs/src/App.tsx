import { createSignal, For } from 'solid-js'
import { addItem, deleteItem, reorderTodos, setChecked, getTodoListReadonly } from  './todo.ts'
import type {TodoItem } from './todo.ts'

function App() {

  const [getTodos, setTodos] = createSignal(getTodoListReadonly());

  deleteItem.addObserver(() => { setTodos([...getTodoListReadonly()]) });
  addItem.addObserver(() => { setTodos([...getTodoListReadonly()]) });
  reorderTodos.addObserver(() => { setTodos([...getTodoListReadonly()]) });
  setChecked.addObserver(() => { setTodos([...getTodoListReadonly()]) });

  return (
    <>
        <AddButtonElement/>
        < TodoListElement getTodos={getTodos} />
    </>
  )
}

export default App

function AddButtonElement() {
    const [text, setText] = createSignal("");
    return (
        <>
            <button onClick={() => {addItem(text()); setText(""); }}>Add</button>
            <input type="text" value={text()} onChange={(e) => setText(e.target.value)}></input>
        </>
    );
}

function TodoListElement({ getTodos }: { getTodos: () => Readonly<TodoItem[]>}) {
    return (
        <For each={getTodos()}>
            {(todo) => <TodoItemElement text={todo.text} checked={todo.checked} id={todo.id} />}
        </For>
    );
}

function TodoItemElement({ text, checked, id }: {text:string, checked: boolean, id: number}) {
    return (
        <li
            draggable="true"
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
