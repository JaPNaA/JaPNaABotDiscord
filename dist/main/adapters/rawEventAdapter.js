"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const events_js_1 = require("../events.js");
class RawEventAdapter {
    constructor(botHooks) {
        this.botHooks = botHooks;
    }
    /**
     * When receiving raw messages
     * @param message of sender
     */
    onMessage(message) {
        let precommandNameInMessage = this.botHooks.precommandManager.getFirstPrecommandName(message.content);
        let channel = message.channel;
        let isDM = false;
        if (channel instanceof discord_js_1.DMChannel) {
            isDM = true;
        }
        else {
            isDM = false;
        }
        const messageEvent = new events_js_1.DiscordMessageEvent({
            username: message.author && message.author.username,
            userId: message.author && message.author.id,
            channelId: message.channel && message.channel.id,
            serverId: message.guild && message.guild.id,
            message: message.content,
            precommandName: precommandNameInMessage,
            originalEvent: message,
            isDM: isDM,
            createdTimestamp: message.createdTimestamp
        });
        if (this.botHooks.client.isSelf(messageEvent.userId)) {
            this.botHooks.events.dispatch("sent", messageEvent);
            return;
        }
        this.botHooks.events.dispatch("message", messageEvent);
    }
    onReady() {
        this.botHooks.events.dispatch("ready", null);
    }
}
exports.default = RawEventAdapter;
