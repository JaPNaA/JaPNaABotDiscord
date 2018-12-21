import BotHooks from "../botHooks.js";
import { DiscordMessageEvent } from "../../events.js";
import CommandManager from "./commandManager.js";
import { DiscordCommandEvent } from "../../events.js";
declare class CommandDispatcher {
    botHooks: BotHooks;
    manager: CommandManager;
    constructor(botHooks: BotHooks, manager: CommandManager);
    /**
     * Handles message event
     */
    onMessage(message: DiscordMessageEvent): void;
    dispatchIfIsCommand(messageEvent: DiscordMessageEvent): void;
    _createDiscordCommandEvent(messageEvent: DiscordMessageEvent): DiscordCommandEvent;
}
export default CommandDispatcher;
