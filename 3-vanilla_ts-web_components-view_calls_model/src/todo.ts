function reactive<T extends object>(target: T, onChange: () => void): T {
    return new Proxy(target, {
        set(obj, prop, value) {
            const result = Reflect.set(obj, prop, value);
            onChange();
            return result;
        }
    });
}

export function addCallbackToTodos(onChange: () => void): void {
    todoList = reactive(todoList, onChange);
}

class IDPool {
    nextVal: number;
    availableVals: Set<number>;

    constructor() {
        this.nextVal = 0;
        this.availableVals = new Set<number>();
    }

    get(): number {
        const next = this.availableVals.values().next();
        const maybeVal = next.value;
        if (maybeVal !== undefined) {
            this.availableVals.delete(maybeVal);
            return maybeVal;
        }
        this.nextVal += 1;
        return this.nextVal - 1;
    }

    return(val: number): void {
        this.availableVals.add(val);
    }

}

let ID_POOL = new IDPool();

export interface TodoItem {
    id: number,
    text: string,
    checked: boolean,

}

export let todoList: TodoItem[] = [
    { id: ID_POOL.get(), text: "foo", checked: false },
    { id: ID_POOL.get(), text: "bar", checked: false },
    { id: ID_POOL.get(), text: "baz", checked: false },
];

function moveItem<T>(arr: T[], from: number, to: number): void {
    const [item] = arr.splice(from, 1);
    if (item === undefined) {
        throw new Error("item out of bounds");
    }
    arr.splice(to, 0, item);
}

export function reorderTodos(draggedId: number, targetId: number): void {
    const fromIndex = todoList.findIndex(t => t.id === draggedId);
    const toIndex = todoList.findIndex(t => t.id === targetId);
    moveItem(todoList, fromIndex, toIndex);
}

export function addItem() {

    let input = document.getElementById("input") as HTMLInputElement;
    if (input === null) {
        throw new Error("Input not found");
    }
    todoList.push({ id: ID_POOL.get(), text: input.value, checked: false });
}


export function deleteItem(id: number): void {
    const idx = todoList.findIndex(t => t.id === id);
    if (idx < 0) { throw new Error(`Cannot delete index ${idx}`); }
    ID_POOL.return(id);
    todoList.splice(idx, 1);
}

export function setChecked(id: number, checked: boolean): void {
    const item = todoList.find(t => t.id === id);
    if (item === undefined) {throw new Error("bad")}
    item.checked = checked;
}

