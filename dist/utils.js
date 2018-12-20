"use strict";
const PATH = require("path");
const Utils = {
    /**
     * Checks if string starts with any of array
     * @param string to test
     * @param arr array of possible starts
     * @returns what item of array string started with
     */
    startsWithAny(string, arr) {
        for (let i of arr) {
            if (string.startsWith(i)) {
                return i;
            }
        }
        return null;
    },
    /**
     * Converts string to array of arguments
     * @param string string to convert
     * @returns arguments
     */
    stringToArgs(string) {
        return string
            .split(/\s+/) // split at every space
            .filter(e => e); // remove any empty
    },
    /**
     * Generates a random number with parameters
     * @param Number min value
     * @param max max value
     * @param step always divisible by
     * @returns generated
     */
    random(min = 0, max = 1, step = 0) {
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
    },
    /**
     * Gets bit from int
     * @param int integer to get bit of
     * @param pos position of bit
     * @returns bit
     */
    getBit(int, pos) {
        return Boolean(int >> pos & 1);
    },
    /**
     * Gets userId from string
     * @param id user id as argument
     * @returns id
     */
    getSnowflakeNum(id) {
        let matches = id.match(/\d{7,}/);
        if (matches) {
            return matches[0];
        }
        return null;
    },
    /**
     * Creates a string from error
     * @param error to convert to string
     * @returns error string
     */
    createErrorString(error) {
        let str = error.stack;
        str = str.split(PATH.dirname(require.main.filename)).join(".");
        return str;
    },
    /**
     * Tries to run a function
     * @param {Function} func function to try to run
     * @returns {String | null} error message, if any
     */
    tryRun(func) {
        try {
            func();
        }
        catch (error) {
            return Utils.createErrorString(error);
        }
        return null;
    }
};
module.exports = Utils;
