import BotHooks from "../../botHooks.js";
import { DiscordCommandEvent, DiscordMessageEvent } from "../../../events.js";
import CommandManager from "./commandManager.js";

import Logger from "../../../logger.js";

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
    onMessage(message: DiscordCommandEvent) {
        Logger.log_message("<<", message);
        this.dispatchIfIsCommand(message);
    }

    dispatchIfIsCommand(commandEvent: DiscordCommandEvent) {
        let someCommandRan = false;

        for (let i = this.manager.commands.length - 1; i >= 0; i--) {
            let command = this.manager.commands[i];
            let ran = command.testAndRun(commandEvent);
            if (ran) {
                someCommandRan = true;
                break;
            }
        }

        if (!someCommandRan) {
            // command doesn't exist
            if (this.botHooks.config.doAlertCommandDoesNotExist) {
                this.botHooks.client.send(commandEvent.channelId, "<@" + commandEvent.userId + ">, that command doesn't exist");
            }
        }
    }
}

export default CommandDispatcher;