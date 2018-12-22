import BotHooks from "../botHooks.js";
import { DiscordMessageEvent } from "../../events.js";
import CommandManager from "./commandManager.js";
declare class CommandDispatcher {
    botHooks: BotHooks;
    manager: CommandManager;
    constructor(botHooks: BotHooks, manager: CommandManager);
    /**
     * Handles message event
     */
    onMessage(message: DiscordMessageEvent): void;
    dispatchIfIsCommand(messageEvent: DiscordMessageEvent): void;
    _createDiscordCommandEvent(messageEvent: DiscordMessageEvent): any;
}
export default CommandDispatcher;
