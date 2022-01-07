"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const random_1 = __importDefault(require("./random"));
function randomString(length) {
    const min = 32;
    const max = 127;
    let rands = [];
    for (let i = 0; i < length; i++) {
        rands.push((0, random_1.default)(min, max, 1));
    }
    return String.fromCharCode(...rands);
}
exports.default = randomString;
