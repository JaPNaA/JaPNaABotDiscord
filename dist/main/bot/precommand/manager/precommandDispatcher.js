"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("../../../events");
const logger_1 = __importDefault(require("../../../logger"));
class PrecommandDispatcher {
    constructor(botHooks, manager) {
        this.botHooks = botHooks;
        this.manager = manager;
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
        this.botHooks.events.dispatch("command", commandEvent);
        commandEvent.precommandName.precommand.callback(commandEvent);
    }
    _createDiscordCommandEvent(messageEvent) {
        const pre = messageEvent.precommandName;
        if (!pre) {
            throw new Error("Unknown error");
        }
        const content = pre && messageEvent.message.slice(pre.name.length);
        return new events_1.DiscordCommandEvent(messageEvent, pre, content);
    }
}
exports.default = PrecommandDispatcher;
