"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commandDispatcher_js_1 = __importDefault(require("./commandDispatcher.js"));
const commandRegistar_js_1 = __importDefault(require("./commandRegistar.js"));
class CommandManager {
    constructor(botHooks) {
        this.register = new commandRegistar_js_1.default(botHooks, this);
        this.dispatch = new commandDispatcher_js_1.default(botHooks, this);
        this.commandGroups = new Map();
        this.precommands = [];
        this.commands = [];
        this.plugins = [];
        this.helpData = {};
    }
    getHelp(command) {
        return this.helpData[command];
    }
    /**
     * checks if message starts with a precommand
     */
    getFirstPrecommand(message) {
        for (let precommand of this.precommands) {
            let startsWithPrecommand = message.startsWith(precommand.precommandStr);
            if (startsWithPrecommand) {
                return precommand;
            }
        }
        return null;
    }
}
exports.default = CommandManager;
