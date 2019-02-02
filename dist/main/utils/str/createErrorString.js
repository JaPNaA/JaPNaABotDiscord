"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
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
exports.default = createErrorString;
