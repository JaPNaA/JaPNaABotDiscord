export default function inlinePromise<T = void>(): {
    promise: Promise<T>;
    res: (x: T) => void;
};
