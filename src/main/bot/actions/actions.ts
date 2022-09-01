import { AllowedThreadTypeForTextChannel, MessageOptions, TextChannel, ThreadChannel, ThreadCreateOptions } from "discord.js";
import Bot from "../bot/bot";
import DiscordMessageEvent from "../events/discordMessageEvent";

export abstract class Action {
    public abstract perform(bot: Bot, event: DiscordMessageEvent): Promise<any>;
}

/**
 * Replies to a message. 'Soft' means the bot will not always use the 'reply'
 * function unless necessary.
 */
export class ReplySoft extends Action {
    constructor(
        public message: string | MessageOptions
    ) { super(); }

    public async perform(bot: Bot, event: DiscordMessageEvent): Promise<any> {
        // if the last message was the command, send message normally but
        // if last message is not the command message, reply to command message
        const channel = await bot.client.getChannel(event.channelId);
        if (channel?.isText()) {
            const lastMessage = channel.messages.cache.last();
            if (lastMessage && lastMessage.id !== event.messageId) {
                try {
                    // reply
                    (await channel.messages.fetch(event.messageId)).reply(this.message);
                } catch (err) {
                    // send normally
                    return bot.client.send(event.channelId, this.message);
                }
            } else {
                // send normally
                return bot.client.send(event.channelId, this.message);
            }
        } else {
            throw new Error("Channel <#" + event.channelId + "> is not a text channel.");
        }
    }
}

/**
 * Sends a message in a channel.
 */
export class Send extends Action {
    constructor(
        public channelId: string,
        public message: string | MessageOptions
    ) { super(); }

    public perform(bot: Bot, event: DiscordMessageEvent): Promise<any> {
        return bot.client.send(this.channelId, this.message);
    }
}

/**
 * Sends a message to a user privately (through DMs)
 */
export class SendPrivate extends Action {
    constructor(
        public userId: string,
        public message: string | MessageOptions
    ) { super(); }

    public perform(bot: Bot): Promise<any> {
        return bot.client.sendDM(this.userId, this.message);
    }
}

/**
 * Creates a thread. 'Soft' means the bot may not create the thread if
 * not possible without throwing an error.
 */
export class ReplyThreadSoft extends Action {
    private thread?: ThreadChannel;

    constructor(
        public threadName: string,
        private options: Partial<ThreadCreateOptions<AllowedThreadTypeForTextChannel>> = {}
    ) { super(); }

    public async perform(bot: Bot, event: DiscordMessageEvent): Promise<any> {
        const channel = await bot.client.getChannel(event.channelId);
        if (!channel) { throw new Error("Channel not found"); }
        if (channel instanceof TextChannel) {
            this.thread = await channel.threads.create({
                name: this.threadName,
                startMessage: event.messageId,
                ...this.options
            });
        }
    }

    public getThread() {
        if (!this.thread) { throw new Error("Action not yet performed"); }
        return this.thread;
    }
}