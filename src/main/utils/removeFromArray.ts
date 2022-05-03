export default function removeFromArray<T>(array: T[], item: T) {
    const index = array.indexOf(item);
    if (index < 0) {
        throw new Error(`Tried to remove ${item}, which was not in array ${array}`);
    }
    array.splice(index, 1);
}
