import BotHooks from "../../bot/botHooks.js";
import DiscordCommandEvent from "../../types/discordCommandEvent.js";
import CommandManager from "./commandManager.js";
declare class CommandDispatcher {
    botHooks: BotHooks;
    manager: CommandManager;
    constructor(botHooks: BotHooks, manager: CommandManager);
    /**
     * Handles message event
     */
    onMessage(message: DiscordCommandEvent): void;
    dispatchIfIsCommand(commandEvent: DiscordCommandEvent): void;
}
export default CommandDispatcher;
