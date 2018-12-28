"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
/**
 * Read ENV file
 * @param path to env file
 */
function readEnv(path) {
    const lines = fs_1.default.readFileSync(path).toString().split("\n");
    const obj = {};
    for (const line of lines) {
        if (line.match(/^\s*#/) || line.match(/^\s*$/)) {
            continue;
        }
        const [key, value] = line.split("=");
        obj[key] = value;
    }
    return obj;
}
exports.default = readEnv;
