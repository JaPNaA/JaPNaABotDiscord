"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Converts string to array of arguments
 * @param string string to convert
 * @returns arguments
 */
function stringToArgs(string) {
    return string
        .split(/\s+/) // split at every space
        .filter(e => e); // remove any empty
}
exports.default = stringToArgs;
