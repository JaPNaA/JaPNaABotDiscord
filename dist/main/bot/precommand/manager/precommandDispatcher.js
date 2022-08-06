"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../../../utils/logger"));
class PrecommandDispatcher {
    bot;
    manager;
    constructor(bot, manager) {
        this.bot = bot;
        this.manager = manager;
        this.bot.events.message.addHandler(this.onMessage.bind(this));
    }
    onMessage(message) {
        logger_1.default.log_message("<<", message.message);
        this.dispatchIfIsPrecommand(message);
    }
    dispatchIfIsPrecommand(messageEvent) {
        if (!messageEvent.precommandName) {
            return;
        }
        const commandEvent = this._createDiscordCommandEvent(messageEvent);
        this.bot.events.command.dispatch(commandEvent);
        commandEvent.precommandName.precommand.callback(commandEvent);
    }
    _createDiscordCommandEvent(messageEvent) {
        const pre = messageEvent.precommandName;
        if (!pre) {
            throw new Error("Unknown error");
        }
        const content = pre && messageEvent.message.slice(pre.name.length);
        return {
            ...messageEvent,
            precommandName: pre,
            commandContent: content,
            arguments: ""
        };
    }
}
exports.default = PrecommandDispatcher;
