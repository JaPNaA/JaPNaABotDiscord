"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Gets userId from string
 * @param id user id as argument
 * @returns id
 */
function getSnowflakeNum(id) {
    let matches = id.match(/\d{7,}/);
    if (matches) {
        return matches[0];
    }
    return null;
}
exports.default = getSnowflakeNum;
