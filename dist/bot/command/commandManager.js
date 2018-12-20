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
        /**
         * @type {Precommand[]} Precommands that trigger the bot, with callbacks
         */
        this.precommands = [];
        /**
         * @type {BotCommand[]} list of commands registered
         */
        this.commands = [];
        /**
         * @type {Map<string, BotCommand[]>} groups of commands
         */
        this.commandGroups = new Map();
        /**
         * @type {Plugin[]} list of plugins registered
         */
        this.plugins = [];
        /**
         * Data for help
         * @type {Object.<string, BotCommandHelp>}
         */
        this.helpData = {};
    }
    getHelp(command) {
        return this.helpData[command];
    }
    /**
     * checks if message starts with a precommand
     * @param {String} message
     * @returns {Precommand}
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
