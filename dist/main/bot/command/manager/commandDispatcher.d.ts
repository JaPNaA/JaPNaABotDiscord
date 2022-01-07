import DiscordCommandEvent from "../../events/discordCommandEvent.js";
import CommandManager from "./commandManager.js";
import Bot from "../../bot/bot.js";
declare class CommandDispatcher {
    private bot;
    manager: CommandManager;
    constructor(bot: Bot, manager: CommandManager);
    /**
     * Handles message event
     */
    onMessage(message: DiscordCommandEvent): void;
    dispatchIfIsCommand(commandEvent: DiscordCommandEvent): Promise<void>;
}
export default CommandDispatcher;
