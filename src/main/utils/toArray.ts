/**
 * Converts element into element array if required
 */
function toArray<T>(element: T | T[]): T[] {
    if (Array.isArray(element)) {
        return element;
    } else {
        return [element];
    }
}

export default toArray;