/**
 * @typedef {import("../../events.js").DiscordMessageEvent} DiscordMessageEvent
 * @typedef {import("../botHooks.js")} BotHooks
 * @typedef {import("./commandManager.js")} CommandManager
 */
declare const Logger: any;
declare const DiscordCommandEvent: any;
declare class CommandDispatcher {
    /**
     * @param {BotHooks} botHooks
     * @param {CommandManager} manager
     */
    constructor(botHooks: any, manager: any);
    /**
     * Handles message event
     * @param {DiscordMessageEvent} message
     */
    onMessage(message: any): void;
    /**
     * @param {DiscordMessageEvent} messageEvent
     */
    dispatchIfIsCommand(messageEvent: any): void;
    /**
     * @param {DiscordMessageEvent} messageEvent
     */
    _createDiscordCommandEvent(messageEvent: any): DiscordCommandEvent;
}
