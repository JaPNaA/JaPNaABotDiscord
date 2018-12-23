"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const precommand_1 = __importDefault(require("./precommand"));
const utils_1 = require("../../utils");
class PrecommandWithCallback extends precommand_1.default {
    constructor(botHooks, name, callback) {
        super(botHooks, name);
        this.names = utils_1.toArray(name);
        this.callback = callback;
    }
}
exports.default = PrecommandWithCallback;
