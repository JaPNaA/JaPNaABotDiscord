"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
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
exports.startsWithAny = startsWithAny;
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
exports.stringToArgs = stringToArgs;
/**
 * Generates a random number with parameters
 * @param Number min value
 * @param max max value
 * @param step always divisible by
 * @returns generated
 */
function random(min = 0, max = 1, step = 0) {
    if (step) { // step is not 0
        let smin = Math.floor(min / step);
        let smax = Math.floor(max / step) + 1;
        return step * Math.floor(smin + Math.random() * (smax - smin));
    }
    else if (step === 1) { // optimize for 1
        return Math.floor(min + Math.random() * (max - min));
    }
    else { // step is 0, no step, default
        return min + Math.random() * (max - min);
    }
}
exports.random = random;
/**
 * Gets bit from int
 * @param int integer to get bit of
 * @param pos position of bit
 * @returns bit
 */
function getBit(int, pos) {
    return Boolean(int >> pos & 1);
}
exports.getBit = getBit;
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
exports.getSnowflakeNum = getSnowflakeNum;
/**
 * Creates a string from error
 * @param error to convert to string
 * @returns error string
 */
function createErrorString(error) {
    let str = error.stack;
    if (require.main && str) {
        str = str.split(path_1.default.dirname(require.main.filename)).join(".");
    }
    else {
        str = "Error generating error string. How ironic.";
    }
    return str;
}
exports.createErrorString = createErrorString;
/**
 * Tries to run a function
 * @param {Function} func function to try to run
 * @returns {String | null} error message, if any
 */
function tryRun(func) {
    try {
        func();
    }
    catch (error) {
        return createErrorString(error);
    }
    return null;
}
exports.tryRun = tryRun;
