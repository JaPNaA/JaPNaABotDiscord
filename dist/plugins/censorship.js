"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_js_1 = __importDefault(require("../main/bot/plugin/plugin.js"));
const logger_1 = __importDefault(require("../main/utils/logger"));
/**
 * Keep channels 'clean,' and get rid free speech.
 */
class Censorship extends plugin_js_1.default {
    userConfigSchema = {
        enabled: {
            type: "boolean",
            comment: "Enable censorship?",
            default: false
        },
        deleteCensoredMessages: {
            type: "boolean",
            comment: "Should the bot delete censored messages? (Otherwise, the bot only ignores the message)",
            default: false
        },
        alertSenderCensor: {
            type: "boolean",
            comment: "Should the sender of the message be DMed and alert about the censor?",
            default: false
        },
        targets: {
            type: "array",
            comment: "What to censor. Array of RegEx strings (case insensitive).",
            default: ["\\[censor this message\\]"]
        }
    };
    constructor(bot) {
        super(bot);
        this.pluginName = "censorship";
    }
    async messageHandler(event, eventControls) {
        const config = await this.config.getAllUserSettingsInChannel(event.channelId);
        if (!config.get("enabled")) {
            return;
        }
        if (!await this._isUserMessage(this.bot, event)) {
            return;
        }
        const targetMatches = config.get("targets");
        for (const target of targetMatches) {
            const regex = new RegExp(target, "i");
            if (regex.test(event.message)) {
                logger_1.default.log("Incoming message censored");
                if (await config.get("deleteCensoredMessages")) {
                    const channel = await this.bot.client.getChannel(event.channelId);
                    if (channel && channel.isText()) {
                        const message = await channel.messages.fetch(event.messageId);
                        if (message) {
                            await message.delete();
                        }
                    }
                }
                if (await config.get("alertSenderCensor")) {
                    this.bot.client.sendDM(event.userId, "Your message was censored.");
                }
                eventControls.stopPropagation();
                eventControls.preventSystemNext();
                break;
            }
        }
    }
    async sendMessageHandler({ channelId, content }, eventControls) {
        const config = await this.config.getAllUserSettingsInChannel(channelId);
        if (!config.get("enabled")) {
            return;
        }
        const targetMatches = config.get("targets");
        if (typeof content !== "string") {
            return;
        }
        for (const target of targetMatches) {
            const regex = new RegExp(target, "i");
            if (regex.test(content)) {
                logger_1.default.log("Outgoing message censored");
                eventControls.stopPropagation();
                eventControls.preventSystemNext();
                break;
            }
        }
    }
    async _isUserMessage(bot, event) {
        const user = await bot.client.getUser(event.userId);
        return Boolean(user && !user.bot);
    }
    _start() {
        this.bot.events.message.addHighPriorityHandler(this.messageHandler.bind(this));
        this.bot.events.send.addHighPriorityHandler(this.sendMessageHandler.bind(this));
    }
    _stop() {
        // do nothing
    }
}
exports.default = Censorship;
