"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mention_1 = __importDefault(require("../../../utils/str/mention"));
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
    async dispatchIfIsCommand(commandEvent) {
        let someCommandRan = false;
        for (let i = this.manager.commands.length - 1; i >= 0; i--) {
            let command = this.manager.commands[i];
            let ran = await command.testAndRun(commandEvent);
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
                this.botHooks.client.send(commandEvent.channelId, mention_1.default(commandEvent.userId) + ", that command doesn't exist");
            }
        }
    }
}
exports.default = CommandDispatcher;
