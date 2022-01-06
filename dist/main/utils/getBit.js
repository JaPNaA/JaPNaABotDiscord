"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Gets bit from int
 * @param int integer to get bit of
 * @param pos position of bit
 * @returns bit
 */
function getBit(int, pos) {
    return Boolean(int >> pos & 1n);
}
exports.default = getBit;
