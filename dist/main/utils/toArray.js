"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Converts element into element array if required
 */
function toArray(element) {
    if (Array.isArray(element)) {
        return element;
    }
    else {
        return [element];
    }
}
exports.default = toArray;
