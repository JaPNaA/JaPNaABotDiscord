"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const createErrorString_1 = __importDefault(require("./str/createErrorString"));
/**
 * Tries to run a function
 * @param func function to try to run
 * @returns error message, if any
 */
async function tryRun(func) {
    try {
        await func();
    }
    catch (error) {
        return (0, createErrorString_1.default)(error);
    }
    return null;
}
exports.default = tryRun;
