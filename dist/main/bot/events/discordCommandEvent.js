"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discordMessageEvent_1 = __importDefault(require("./discordMessageEvent"));
class DiscordCommandEvent extends discordMessageEvent_1.default {
    constructor(data) {
        // inheirt all properties of DiscordMessageEvent
        super(data.messageEvent);
        /** Arguments of command */
        this.arguments = null;
        this.precommandName = data.pre;
        this.commandContent = data.content;
    }
}
exports.default = DiscordCommandEvent;
