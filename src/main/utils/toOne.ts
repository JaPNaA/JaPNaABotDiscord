/**
 * Converts array into one element if required
 */
function toOne<T>(element: T | T[]): T {
    if (Array.isArray(element)) {
        return element[0];
    } else {
        return element;
    }
}

export default toOne;