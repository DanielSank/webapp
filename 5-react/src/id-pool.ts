export class IDPool {
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
