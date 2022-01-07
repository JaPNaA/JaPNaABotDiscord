"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../../../utils/logger"));
const discordCommandEvent_1 = __importDefault(require("../../events/discordCommandEvent"));
class PrecommandDispatcher {
    constructor(bot, manager) {
        this.bot = bot;
        this.manager = manager;
        this.bot.events.on("message", this.onMessage.bind(this));
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
        this.bot.events.dispatch("command", commandEvent);
        commandEvent.precommandName.precommand.callback(commandEvent);
    }
    _createDiscordCommandEvent(messageEvent) {
        const pre = messageEvent.precommandName;
        if (!pre) {
            throw new Error("Unknown error");
        }
        const content = pre && messageEvent.message.slice(pre.name.length);
        return new discordCommandEvent_1.default({
            messageEvent: messageEvent,
            pre: pre,
            content: content
        });
    }
}
exports.default = PrecommandDispatcher;
