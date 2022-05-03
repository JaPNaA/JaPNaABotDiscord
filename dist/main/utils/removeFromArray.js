"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function removeFromArray(array, item) {
    const index = array.indexOf(item);
    if (index < 0) {
        throw new Error(`Tried to remove ${item}, which was not in array ${array}`);
    }
    array.splice(index, 1);
}
exports.default = removeFromArray;
