import BotHooks from "../botHooks.js";
import { DiscordMessageEvent } from "../../events.js";
import CommandManager from "./commandManager.js";
declare class CommandDispatcher {
    botHooks: BotHooks;
    manager: CommandManager;
    /**
     * @param {BotHooks} botHooks
     * @param {CommandManager} manager
     */
    constructor(botHooks: BotHooks, manager: CommandManager);
    /**
     * Handles message event
     * @param {DiscordMessageEvent} message
     */
    onMessage(message: DiscordMessageEvent): void;
    /**
     * @param {DiscordMessageEvent} messageEvent
     */
    dispatchIfIsCommand(messageEvent: DiscordMessageEvent): void;
    /**
     * @param {DiscordMessageEvent} messageEvent
     */
    _createDiscordCommandEvent(messageEvent: DiscordMessageEvent): any;
}
export default CommandDispatcher;
