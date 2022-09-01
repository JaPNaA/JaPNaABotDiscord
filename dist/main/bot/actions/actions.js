"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplyThreadSoft = exports.SendPrivate = exports.Send = exports.ReplySoft = exports.Action = void 0;
const discord_js_1 = require("discord.js");
class Action {
}
exports.Action = Action;
/**
 * Replies to a message. 'Soft' means the bot will not always use the 'reply'
 * function unless necessary.
 */
class ReplySoft extends Action {
    message;
    constructor(message) {
        super();
        this.message = message;
    }
    async perform(bot, event) {
        // if the last message was the command, send message normally but
        // if last message is not the command message, reply to command message
        const channel = await bot.client.getChannel(event.channelId);
        if (channel?.isText()) {
            const lastMessage = channel.messages.cache.last();
            if (lastMessage && lastMessage.id !== event.messageId) {
                try {
                    // reply
                    (await channel.messages.fetch(event.messageId)).reply(this.message);
                }
                catch (err) {
                    // send normally
                    return bot.client.send(event.channelId, this.message);
                }
            }
            else {
                // send normally
                return bot.client.send(event.channelId, this.message);
            }
        }
        else {
            throw new Error("Channel <#" + event.channelId + "> is not a text channel.");
        }
    }
}
exports.ReplySoft = ReplySoft;
/**
 * Sends a message in a channel.
 */
class Send extends Action {
    channelId;
    message;
    constructor(channelId, message) {
        super();
        this.channelId = channelId;
        this.message = message;
    }
    perform(bot, event) {
        return bot.client.send(this.channelId, this.message);
    }
}
exports.Send = Send;
/**
 * Sends a message to a user privately (through DMs)
 */
class SendPrivate extends Action {
    userId;
    message;
    constructor(userId, message) {
        super();
        this.userId = userId;
        this.message = message;
    }
    perform(bot) {
        return bot.client.sendDM(this.userId, this.message);
    }
}
exports.SendPrivate = SendPrivate;
/**
 * Creates a thread. 'Soft' means the bot may not create the thread if
 * not possible without throwing an error.
 */
class ReplyThreadSoft extends Action {
    threadName;
    options;
    thread;
    constructor(threadName, options = {}) {
        super();
        this.threadName = threadName;
        this.options = options;
    }
    async perform(bot, event) {
        const channel = await bot.client.getChannel(event.channelId);
        if (!channel) {
            throw new Error("Channel not found");
        }
        if (channel instanceof discord_js_1.TextChannel) {
            this.thread = await channel.threads.create({
                name: this.threadName,
                startMessage: event.messageId,
                ...this.options
            });
        }
    }
    getThread() {
        if (!this.thread) {
            throw new Error("Action not yet performed");
        }
        return this.thread;
    }
}
exports.ReplyThreadSoft = ReplyThreadSoft;
