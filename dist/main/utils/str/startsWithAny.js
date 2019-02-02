"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Checks if string starts with any of array
 * @param string to test
 * @param arr array of possible starts
 * @returns what item of array string started with
 */
function startsWithAny(string, arr) {
    for (let i of arr) {
        if (string.startsWith(i)) {
            return i;
        }
    }
    return null;
}
exports.default = startsWithAny;
