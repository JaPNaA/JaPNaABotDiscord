import BotHooks from "../botHooks.js";
import { DiscordMessageEvent } from "../../events.js";
import CommandManager from "./commandManager.js";

/**
 * @typedef {import("../../events.js").DiscordMessageEvent} DiscordMessageEvent
 * @typedef {import("../botHooks.js")} BotHooks
 * @typedef {import("./commandManager.js")} CommandManager
 */

const Logger = require("../../logger.js");
const { DiscordCommandEvent } = require("../../events.js");

class CommandDispatcher {
    botHooks: BotHooks;
    manager: CommandManager;
    /**
     * @param {BotHooks} botHooks 
     * @param {CommandManager} manager 
     */
    constructor(botHooks: BotHooks, manager: CommandManager) {
        this.botHooks = botHooks;
        this.manager = manager;
    }

    /**
     * Handles message event
     * @param {DiscordMessageEvent} message 
     */
    onMessage(message: DiscordMessageEvent) {
        Logger.log_message("<<", message);
        this.dispatchIfIsCommand(message);
    }

    /**
     * @param {DiscordMessageEvent} messageEvent
     */
    dispatchIfIsCommand(messageEvent: DiscordMessageEvent) {
        if (!messageEvent.precommand) return;
        const commandEvent = this._createDiscordCommandEvent(messageEvent);
        this.botHooks.events.dispatch("command", commandEvent);
        commandEvent.precommand.callback(commandEvent);
    }

    /**
     * @param {DiscordMessageEvent} messageEvent
     */
    _createDiscordCommandEvent(messageEvent: DiscordMessageEvent) {
        const pre = messageEvent.precommand;
        const content = pre && messageEvent.message.slice(pre.precommandStr.length);
        return new DiscordCommandEvent(messageEvent, pre, content);
    }
}

export default CommandDispatcher;