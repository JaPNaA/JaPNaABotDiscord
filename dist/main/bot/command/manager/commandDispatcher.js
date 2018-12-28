"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const specialUtils_js_1 = require("../../../specialUtils.js");
class CommandDispatcher {
    constructor(botHooks, manager) {
        this.botHooks = botHooks;
        this.manager = manager;
    }
    /**
     * Handles message event
     */
    onMessage(message) {
        this.dispatchIfIsCommand(message);
    }
    dispatchIfIsCommand(commandEvent) {
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
            if (this.manager.unknownCommandHandler) {
                this.manager.unknownCommandHandler(this.botHooks, commandEvent);
            }
            else if (this.botHooks.config.doAlertCommandDoesNotExist) {
                this.botHooks.client.send(commandEvent.channelId, specialUtils_js_1.mention(commandEvent.userId) + ", that command doesn't exist");
            }
        }
    }
}
exports.default = CommandDispatcher;
