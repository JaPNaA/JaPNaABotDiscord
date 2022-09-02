export default function inlinePromise<T = void>(): { promise: Promise<T>, res: (x: T) => void } {
    let res!: (x: T) => void;
    const promise = new Promise<T>(r => res = r);
    return { promise, res };
}
