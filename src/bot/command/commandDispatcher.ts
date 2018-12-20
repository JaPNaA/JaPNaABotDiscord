/**
 * @typedef {import("../../events.js").DiscordMessageEvent} DiscordMessageEvent
 * @typedef {import("../botHooks.js")} BotHooks
 * @typedef {import("./commandManager.js")} CommandManager
 */

const Logger = require("../../logger.js");
const { DiscordCommandEvent } = require("../../events.js");

class CommandDispatcher {
    botHooks: any;
    manager: any;
    /**
     * @param {BotHooks} botHooks 
     * @param {CommandManager} manager 
     */
    constructor(botHooks: BotHooks, manager: CommandManager) {
        /** @type {BotHooks} */
        this.botHooks = botHooks;

        /** @type {CommandManager} */
        this.manager = manager;
    }

    /**
     * Handles message event
     * @param {DiscordMessageEvent} message 
     */
    onMessage(message) {
        Logger.log_message("<<", message);
        this.dispatchIfIsCommand(message);
    }

    /**
     * @param {DiscordMessageEvent} messageEvent
     */
    dispatchIfIsCommand(messageEvent) {
        if (!messageEvent.precommand) return;
        const commandEvent = this._createDiscordCommandEvent(messageEvent);
        this.botHooks.events.dispatch("command", commandEvent);
        commandEvent.precommand.callback(commandEvent);
    }

    /**
     * @param {DiscordMessageEvent} messageEvent
     */
    _createDiscordCommandEvent(messageEvent) {
        const pre = messageEvent.precommand;
        const content = messageEvent.message.slice(pre.precommandStr.length);
        return new DiscordCommandEvent(messageEvent, pre, content);
    }
}

export default CommandDispatcher;