"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Converts array into one element if required
 */
function toOne(element) {
    if (Array.isArray(element)) {
        return element[0];
    }
    else {
        return element;
    }
}
exports.default = toOne;
