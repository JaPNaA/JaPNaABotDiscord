import BotHooks from "../../botHooks.js";
import { DiscordCommandEvent } from "../../../events.js";
import CommandManager from "./commandManager.js";

import BotCommand from "../command.js";
import { mention } from "../../../specialUtils.js";

class CommandDispatcher {
    botHooks: BotHooks;
    manager: CommandManager;

    constructor(botHooks: BotHooks, manager: CommandManager) {
        this.botHooks = botHooks;
        this.manager = manager;
    }

    /**
     * Handles message event
     */
    onMessage(message: DiscordCommandEvent): void {
        this.dispatchIfIsCommand(message);
    }

    dispatchIfIsCommand(commandEvent: DiscordCommandEvent): void {
        let someCommandRan: boolean = false;

        for (let i: number = this.manager.commands.length - 1; i >= 0; i--) {
            let command: BotCommand = this.manager.commands[i];
            let ran: boolean = command.testAndRun(commandEvent);
            if (ran) {
                someCommandRan = true;
                break;
            }
        }

        if (!someCommandRan) {
            // command doesn't exist
            if (this.manager.unknownCommandHandler) {
                this.manager.unknownCommandHandler(this.botHooks, commandEvent);
            } else if (this.botHooks.config.doAlertCommandDoesNotExist) {
                this.botHooks.client.send(
                    commandEvent.channelId, 
                    mention(commandEvent.userId) + ", that command doesn't exist"
                );
            }
        }
    }
}

export default CommandDispatcher;