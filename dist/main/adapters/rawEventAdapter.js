"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
class RawEventAdapter {
    bot;
    constructor(bot) {
        this.bot = bot;
    }
    /**
     * When receiving raw messages
     * @param message of sender
     */
    onMessage(message) {
        let precommandNameInMessage = this.bot.precommandManager.getFirstPrecommandName(message.content);
        let channel = message.channel;
        let isDM = false;
        if (channel instanceof discord_js_1.DMChannel) {
            isDM = true;
        }
        else {
            isDM = false;
        }
        const messageEvent = {
            username: message.author && message.author.username,
            userId: message.author && message.author.id,
            channelId: message.channel && message.channel.id,
            serverId: message.guild && message.guild.id || "",
            messageId: message.id,
            message: message.content,
            precommandName: precommandNameInMessage,
            originalEvent: message,
            isDM: isDM,
            createdTimestamp: message.createdTimestamp
        };
        if (this.bot.client.isSelf(messageEvent.userId)) {
            this.bot.events.dispatch("sent", messageEvent);
            return;
        }
        this.bot.events.dispatch("message", messageEvent);
    }
    onReady() {
        this.bot.events.dispatch("ready", null);
    }
}
exports.default = RawEventAdapter;
