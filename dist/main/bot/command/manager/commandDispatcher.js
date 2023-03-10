"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mention_1 = __importDefault(require("../../../utils/str/mention"));
class CommandDispatcher {
    bot;
    manager;
    constructor(bot, manager) {
        this.bot = bot;
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
            const command = this.manager.commands[i];
            if (command.isCommandEventMatch(commandEvent)) {
                await command.run(commandEvent);
                someCommandRan = true;
                break;
            }
        }
        if (!someCommandRan) {
            // command doesn't exist
            if (this.manager.unknownCommandHandler) {
                this.manager.unknownCommandHandler.run(commandEvent);
            }
            else if (this.bot.config.doAlertCommandDoesNotExist) {
                this.bot.client.send(commandEvent.channelId, (0, mention_1.default)(commandEvent.userId) + ", that command doesn't exist");
            }
        }
    }
}
exports.default = CommandDispatcher;
