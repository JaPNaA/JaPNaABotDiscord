"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @typedef {import("../../events.js").DiscordMessageEvent} DiscordMessageEvent
 * @typedef {import("../botHooks.js")} BotHooks
 * @typedef {import("./commandManager.js")} CommandManager
 */
const logger_js_1 = __importDefault(require("../../logger.js"));
const events_js_1 = require("../../events.js");
class CommandDispatcher {
    /**
     * @param {BotHooks} botHooks
     * @param {CommandManager} manager
     */
    constructor(botHooks, manager) {
        this.botHooks = botHooks;
        this.manager = manager;
    }
    /**
     * Handles message event
     * @param {DiscordMessageEvent} message
     */
    onMessage(message) {
        logger_js_1.default.log_message("<<", message);
        this.dispatchIfIsCommand(message);
    }
    /**
     * @param {DiscordMessageEvent} messageEvent
     */
    dispatchIfIsCommand(messageEvent) {
        if (!messageEvent.precommand)
            return;
        const commandEvent = this._createDiscordCommandEvent(messageEvent);
        this.botHooks.events.dispatch("command", commandEvent);
        commandEvent.precommand.callback(commandEvent);
    }
    /**
     * @param {DiscordMessageEvent} messageEvent
     */
    _createDiscordCommandEvent(messageEvent) {
        const pre = messageEvent.precommand;
        if (!pre)
            throw new Error("Unknown error");
        const content = pre && messageEvent.message.slice(pre.precommandStr.length);
        return new events_js_1.DiscordCommandEvent(messageEvent, pre, content);
    }
}
exports.default = CommandDispatcher;
