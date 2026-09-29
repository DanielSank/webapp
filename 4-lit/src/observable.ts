import { IDPool } from './id-pool.ts'

const ID_POOL = new IDPool();

export type ObservableFunction<Args extends unknown[], R> = ((...args: Args) => R) & {
    addObserver: (obs: (result: R, ...args: Args) => void) => number;
    removeObserver: (id: number) => boolean;
};

export function makeObservable<Args extends unknown[], R>(
        fn: (...args: Args) => R
): ObservableFunction<Args, R> {
    const observers = new Map<number, (result: R, ...args: Args) => void>();

    function addObserver(obs: (result: R, ...args: Args) => void): number {
        const id = ID_POOL.get();
        observers.set(id, obs);
        return id;
    }

    function removeObserver(id: number): boolean {
        if (observers.has(id)) {
            observers.delete(id);
            ID_POOL.return(id);
            return true;
        }
        return false;
    }

    function wrapped(...args: Args): R {
        const result = fn(...args);
        observers.forEach(obs => obs(result, ...args));
        return result;
    }

    wrapped.addObserver = addObserver;
    wrapped.removeObserver = removeObserver;
    return wrapped;
}
