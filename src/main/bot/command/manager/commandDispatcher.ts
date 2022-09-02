import DiscordCommandEvent from "../../events/discordCommandEvent.js";
import CommandManager from "./commandManager.js";

import BotCommand from "../command.js";
import mention from "../../../utils/str/mention";
import Bot from "../../bot/bot.js";

class CommandDispatcher {
    manager: CommandManager;

    constructor(private bot: Bot, manager: CommandManager) {
        this.manager = manager;
    }

    /**
     * Handles message event
     */
    onMessage(message: DiscordCommandEvent): void {
        this.dispatchIfIsCommand(message);
    }

    async dispatchIfIsCommand(commandEvent: DiscordCommandEvent) {
        let someCommandRan: boolean = false;

        for (let i: number = this.manager.commands.length - 1; i >= 0; i--) {
            let command: BotCommand = this.manager.commands[i];
            let ran: boolean = await command.testAndRun(commandEvent);
            if (ran) {
                someCommandRan = true;
                break;
            }
        }

        if (!someCommandRan) {
            // command doesn't exist
            if (this.manager.unknownCommandHandler) {
                this.manager.unknownCommandHandler.tryRunCommand(commandEvent);
            } else if (this.bot.config.doAlertCommandDoesNotExist) {
                this.bot.client.send(
                    commandEvent.channelId, 
                    mention(commandEvent.userId) + ", that command doesn't exist"
                );
            }
        }
    }
}

export default CommandDispatcher;