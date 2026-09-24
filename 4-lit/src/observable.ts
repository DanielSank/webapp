export type ObservableFunction<Args extends any[], R> = ((...args: Args) => R) & {
    addObserver: (obs: (result: R, ...args: Args) => void) => void;
};


export function makeObservable<Args extends any[], R>(
        fn: (...args: Args) => R
): ObservableFunction<Args, R> {
    const observers: Array<(result: R, ...args: Args) => void> = [];

    function addObserver(obs: (result: R, ...args: Args) => void): void {
        observers.push(obs);
    }

    function wrapped(...args: Args): R {
        const result = fn(...args);
        observers.forEach(obs => obs(result, ...args));
        return result;
    }

    wrapped.addObserver = addObserver;
    return wrapped;
}
