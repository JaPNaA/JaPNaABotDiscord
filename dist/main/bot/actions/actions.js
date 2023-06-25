"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplyReact = exports.React = exports.DeleteMessageSoft = exports.ReplyThreadSoft = exports.SendPrivate = exports.Send = exports.ReplyUnimportant = exports.ReplyPrivate = exports.ReplySoft = exports.Action = void 0;
const discord_js_1 = require("discord.js");
const toOne_1 = __importDefault(require("../../utils/toOne"));
class Action {
}
exports.Action = Action;
class Reply extends Action {
    message;
    sentMessage;
    suppressNotifications = true;
    constructor(message) {
        super();
        this.message = message;
    }
    getMessage() {
        if (!this.sentMessage) {
            throw new ActionNotYetPerformedError();
        }
        return (0, toOne_1.default)(this.sentMessage);
    }
    setSendNotifications() {
        this.suppressNotifications = false;
        return this;
    }
    async send(bot, channelId) {
        if (this.suppressNotifications) {
            if (typeof this.message == "string") {
                this.sentMessage = await bot.client.send(channelId, {
                    content: this.message,
                    // @ts-ignore -- discord.js is expecting SuppressEmbeds, but SuppressNotifications works fine
                    flags: discord_js_1.MessageFlags.SuppressNotifications
                });
            }
            else {
                const newFlags = new discord_js_1.BitField(this.message.flags);
                // @ts-ignore -- discord.js is expecting SuppressEmbeds, but SuppressNotifications works fine
                newFlags.add(discord_js_1.MessageFlags.SuppressNotifications);
                this.sentMessage = await bot.client.send(channelId, {
                    ...this.message,
                    flags: newFlags
                });
            }
        }
        else {
            this.sentMessage = await bot.client.send(channelId, this.message);
        }
    }
}
/**
 * Replies to a message. 'Soft' means the bot will not always use the 'reply'
 * function unless necessary.
 *
 * Intended for general response messages
 */
class ReplySoft extends Reply {
    async perform(bot, event) {
        // if the last message was the command, send message normally but
        // if last message is not the command message, reply to command message
        const channel = await bot.client.getChannel(event.channelId);
        if (channel?.isTextBased() && 'messages' in channel) {
            const lastMessage = channel.messages.cache.last();
            if (lastMessage && lastMessage.id !== event.messageId) {
                try {
                    // reply
                    this.sentMessage = await (await channel.messages.fetch(event.messageId)).reply(this.message);
                }
                catch (err) {
                    await this.send(bot, event.channelId);
                }
            }
            else {
                await this.send(bot, event.channelId);
            }
        }
        else {
            throw new Error("Channel <#" + event.channelId + "> is not a text channel, or does not have a messages attribute.");
        }
    }
    async performInteraction(bot, interaction) {
        if (interaction.isRepliable()) {
            this.sentMessage = await followUpOrReply(bot, interaction, this.message);
        }
        else if (interaction.channelId) {
            // send normally
            this.send(bot, interaction.channelId);
        }
        else {
            throw new Error("Cannot respond.");
        }
    }
}
exports.ReplySoft = ReplySoft;
/**
 * Replies to a message privately. Only the runner will
 * see the message.
 *
 * Intended for sending private information
 */
class ReplyPrivate extends Reply {
    perform(bot, event) {
        return bot.client.sendDM(event.userId, this.message);
    }
    async performInteraction(bot, interaction) {
        if (interaction.isRepliable()) {
            this.sentMessage = await followUpOrReply(bot, interaction, ephemeralize(this.message));
        }
        else {
            this.sentMessage = await bot.client.sendDM(interaction.user.id, this.message);
        }
    }
}
exports.ReplyPrivate = ReplyPrivate;
/**
 * Replies to a message. Will hide the message from others
 * if convenient for the user.
 *
 * Intended for error messages, 'empty' messages, messages everyone
 * doesn't need to see.
 */
class ReplyUnimportant extends Reply {
    perform(bot, event) {
        return this.send(bot, event.channelId);
    }
    async performInteraction(bot, interaction) {
        if (interaction.isRepliable()) {
            this.sentMessage = await followUpOrReply(bot, interaction, ephemeralize(this.message));
        }
        else if (interaction.channelId) {
            this.send(bot, interaction.channelId);
        }
        else {
            this.sentMessage = await bot.client.sendDM(interaction.user.id, this.message);
        }
    }
}
exports.ReplyUnimportant = ReplyUnimportant;
/**
 * Sends a message in a channel.
 *
 * Intended for messages not triggered by a command directly.
 * Ex. reminders, routine messages, announcements, etc.
 */
class Send extends Reply {
    channelId;
    constructor(channelId, message) {
        super(message);
        this.channelId = channelId;
    }
    async perform(bot) {
        return this.send(bot, this.channelId);
    }
    async performInteraction(bot, interaction) {
        if (interaction.isRepliable() && this.channelId === interaction.channelId) {
            this.sentMessage = await followUpOrReply(bot, interaction, this.message);
        }
        else {
            return this.perform(bot);
        }
    }
    getMessage() {
        if (!this.sentMessage) {
            throw new ActionNotYetPerformedError();
        }
        return (0, toOne_1.default)(this.sentMessage);
    }
}
exports.Send = Send;
/**
 * Sends a message to a user privately (through DMs)
 *
 * Intended for private messages not triggered by a command directly.
 * Ex. reminders, routine messages, announcements, etc.
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
    async performInteraction(bot, interaction) {
        if (interaction.isRepliable() && this.userId === interaction.user.id) {
            return followUpOrReply(bot, interaction, ephemeralize(this.message));
        }
        else {
            this.perform(bot);
        }
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
        await this.createThread(bot, event.channelId, event.messageId);
    }
    async performInteraction(bot, interaction) {
        if (interaction.channelId) {
            await this.createThread(bot, interaction.channelId, undefined);
        }
    }
    async createThread(bot, inChannel, replyMessage) {
        const channel = await bot.client.getChannel(inChannel);
        if (!channel) {
            throw new Error("Channel not found");
        }
        if (channel instanceof discord_js_1.TextChannel) {
            this.thread = await channel.threads.create({
                name: this.threadName,
                startMessage: replyMessage,
                ...this.options
            });
        }
    }
    getThread() {
        if (!this.thread) {
            throw new ActionNotYetPerformedError();
        }
        return this.thread;
    }
}
exports.ReplyThreadSoft = ReplyThreadSoft;
/**
 * Deletes a message. 'Soft' means the bot won't throw an error if
 * the bot cannot delete the message.
 */
class DeleteMessageSoft extends Action {
    channelId;
    messageId;
    constructor(channelId, messageId) {
        super();
        this.channelId = channelId;
        this.messageId = messageId;
    }
    async perform(bot) {
        const channel = await bot.client.getChannel(this.channelId);
        if (channel?.isTextBased() && 'messages' in channel) {
            await channel.messages.fetch(this.messageId)
                .then(message => message.delete())
                .catch(_ => { });
        }
    }
    async performInteraction(bot) {
        return this.perform(bot);
    }
}
exports.DeleteMessageSoft = DeleteMessageSoft;
/**
 * Reactions to a message with an emoji.
 */
class React extends Action {
    channelId;
    messageId;
    emoji;
    constructor(channelId, messageId, emoji) {
        super();
        this.channelId = channelId;
        this.messageId = messageId;
        this.emoji = emoji;
    }
    async perform(bot) {
        const channel = await bot.client.getChannel(this.channelId);
        if (channel?.isTextBased() && 'messages' in channel) {
            await (await channel.messages.fetch(this.messageId)).react(this.emoji);
        }
    }
    async performInteraction(bot) {
        return this.perform(bot);
    }
}
exports.React = React;
/**
 * Responds to a message with a reaction emoji.
 */
class ReplyReact extends Action {
    emoji;
    constructor(emoji) {
        super();
        this.emoji = emoji;
    }
    async perform(bot, event) {
        const channel = await bot.client.getChannel(event.channelId);
        if (channel?.isTextBased() && 'messages' in channel) {
            try {
                await (await channel.messages.fetch(event.messageId)).react(this.emoji);
            }
            catch (err) {
                return new ReplyUnimportant(this.emoji).perform(bot, event);
            }
        }
    }
    async performInteraction(bot, interaction) {
        return new ReplyUnimportant(this.emoji).performInteraction(bot, interaction);
    }
}
exports.ReplyReact = ReplyReact;
class ActionNotYetPerformedError extends Error {
    constructor() {
        super("Action not yet performed");
    }
}
async function followUpOrReply(bot, interaction, message) {
    if (!interaction.isRepliable()) {
        throw new Error("Cannot reply");
    }
    if (interaction.replied) {
        const sentMessage = await interaction.followUp(message);
        if (interaction.channelId) {
            return bot.client.getMessageFromChannel(interaction.channelId, sentMessage.id);
        }
    }
    else {
        await interaction.reply(message);
        if (interaction.channelId) {
            return bot.client.getMessageFromChannel(interaction.channelId, (await interaction.fetchReply()).id);
        }
    }
}
function ephemeralize(message) {
    if (typeof message === "string") {
        return {
            content: message,
            ephemeral: true
        };
    }
    else {
        return {
            ...message,
            ephemeral: true
        };
    }
}
