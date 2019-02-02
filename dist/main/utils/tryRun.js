"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const createErrorString_1 = __importDefault(require("./createErrorString"));
/**
 * Tries to run a function
 * @param func function to try to run
 * @returns error message, if any
 */
function tryRun(func) {
    try {
        func();
    }
    catch (error) {
        return createErrorString_1.default(error);
    }
    return null;
}
exports.default = tryRun;
