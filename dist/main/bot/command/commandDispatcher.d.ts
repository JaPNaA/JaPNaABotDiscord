import BotHooks from "../botHooks.js";
import { DiscordMessageEvent } from "../../events.js";
import CommandManager from "./commandManager.js";
import { DiscordCommandEvent } from "../../events.js";
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
    _createDiscordCommandEvent(messageEvent: DiscordMessageEvent): DiscordCommandEvent;
}
export default CommandDispatcher;
