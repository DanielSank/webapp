import { createSignal, For, onCleanup } from 'solid-js'
import { addItem, deleteItem, reorderTodos, setChecked, getTodoListReadonly } from  './todo.ts'
import type {TodoItem } from './todo.ts'

function App() {

  const [getTodos, setTodos] = createSignal(getTodoListReadonly());

  const deleteId = deleteItem.addObserver(() => { setTodos([...getTodoListReadonly()]) });
  const addId = addItem.addObserver(() => { setTodos([...getTodoListReadonly()]) });
  const reorderId = reorderTodos.addObserver(() => { setTodos([...getTodoListReadonly()]) });
  const checkedId = setChecked.addObserver(() => { setTodos([...getTodoListReadonly()]) });

  onCleanup( () => {
    deleteItem.removeObserver(deleteId);
    addItem.removeObserver(addId);
    reorderTodos.removeObserver(reorderId);
    setChecked.removeObserver(checkedId);
  });

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
            <input type="text" value={text()} onInput={(e) => setText(e.target.value)}></input>
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
            onDragStart={ (e) => {
                const dataTransfer = e.dataTransfer;
                if (dataTransfer === null) { throw new Error("No data transfer.");}
                dataTransfer.setData("text/plain", String(id));
            }}
            onDragOver={ (e) => {e.preventDefault();} }
            onDrop={ (e) => {
                const dataTransfer = e.dataTransfer;
                if (dataTransfer === null) { throw new Error("No data transfer.");}
                const draggedId = Number(dataTransfer.getData("text/plain"));
                reorderTodos(draggedId, id);
            }}
        >
            <input type="checkbox" checked={checked} onChange={(e) => setChecked(id, e.target.checked)}></input>
            <span>{text}</span>
            <button onClick={() => deleteItem(id)}>delete</button>
        </li>
    )
}
