import { AllowedThreadTypeForTextChannel, CacheType, Interaction, InteractionReplyOptions, Message, MessageOptions, TextChannel, ThreadChannel, ThreadCreateOptions } from "discord.js";
import toOne from "../../utils/toOne";
import Bot from "../bot/bot";
import DiscordMessageEvent from "../events/discordMessageEvent";

export abstract class Action {
    public abstract perform(bot: Bot, event: DiscordMessageEvent): Promise<any>;
    public abstract performInteraction(bot: Bot, interaction: Interaction): Promise<any>;
}

/**
 * Replies to a message. 'Soft' means the bot will not always use the 'reply'
 * function unless necessary.
 */
export class ReplySoft extends Action {
    private sentMessage?: Message | Message[];

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
                    this.sentMessage = await (await channel.messages.fetch(event.messageId)).reply(this.message);
                } catch (err) {
                    // send normally
                    this.sentMessage = await bot.client.send(event.channelId, this.message);
                }
            } else {
                // send normally
                this.sentMessage = await bot.client.send(event.channelId, this.message);
            }
        } else {
            throw new Error("Channel <#" + event.channelId + "> is not a text channel.");
        }
    }

    public async performInteraction(bot: Bot, interaction: Interaction) {
        if (interaction.isRepliable()) {
            this.sentMessage = await followUpOrReply(bot, interaction, this.message as any);
        } else if (interaction.channelId) {
            // send normally
            this.sentMessage = await bot.client.send(interaction.channelId, this.message);
        } else {
            throw new Error("Cannot respond.");
        }
    }

    public getMessage(): Message {
        if (!this.sentMessage) { throw new ActionNotYetPerformedError(); }
        return toOne(this.sentMessage);
    }
}

export class ReplyPrivate extends Action {
    constructor(
        public message: string | MessageOptions
    ) { super(); }

    public perform(bot: Bot, event: DiscordMessageEvent): Promise<any> {
        return bot.client.sendDM(event.userId, this.message);
    }

    public async performInteraction(bot: Bot, interaction: Interaction<CacheType>): Promise<any> {
        if (interaction.isRepliable()) {
            return followUpOrReply(bot, interaction, ephemeralize(this.message));
        } else {
            return bot.client.sendDM(interaction.user.id, this.message);
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

    public perform(bot: Bot): Promise<any> {
        return bot.client.send(this.channelId, this.message);
    }

    public async performInteraction(bot: Bot, interaction: Interaction<CacheType>): Promise<any> {
        if (interaction.isRepliable() && this.channelId === interaction.channelId) {
            return followUpOrReply(bot, interaction, this.message as any);
        } else {
            this.perform(bot);
        }
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

    public async performInteraction(bot: Bot, interaction: Interaction<CacheType>): Promise<any> {
        if (interaction.isRepliable() && this.userId === interaction.user.id) {
            return followUpOrReply(bot, interaction, ephemeralize(this.message as any));
        } else {
            this.perform(bot);
        }
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
        await this.createThread(bot, event.channelId, event.messageId);
    }

    public async performInteraction(bot: Bot, interaction: Interaction<CacheType>): Promise<any> {
        if (interaction.channelId) {
            await this.createThread(bot, interaction.channelId, undefined);
        }
    }

    private async createThread(bot: Bot, inChannel: string, replyMessage: string | undefined) {
        const channel = await bot.client.getChannel(inChannel);
        if (!channel) { throw new Error("Channel not found"); }
        if (channel instanceof TextChannel) {
            this.thread = await channel.threads.create({
                name: this.threadName,
                startMessage: replyMessage,
                ...this.options
            });
        }
    }

    public getThread() {
        if (!this.thread) { throw new ActionNotYetPerformedError(); }
        return this.thread;
    }
}

/**
 * Deletes a message. 'Soft' means the bot won't throw an error if
 * the bot cannot delete the message.
 */
export class DeleteMessageSoft extends Action {
    constructor(
        public channelId: string,
        public messageId: string
    ) { super(); }

    public async perform(bot: Bot): Promise<any> {
        const channel = await bot.client.getChannel(this.channelId);
        if (channel?.isText()) {
            channel.messages.fetch(this.messageId)
                .then(message => message.delete())
                .catch(_ => { });
        }
    }

    public async performInteraction(bot: Bot): Promise<any> {
        this.perform(bot);
    }
}

class ActionNotYetPerformedError extends Error {
    constructor() {
        super("Action not yet performed");
    }
}

async function followUpOrReply(bot: Bot, interaction: Interaction, message: string | InteractionReplyOptions): Promise<Message | undefined> {
    if (!interaction.isRepliable()) { throw new Error("Cannot reply"); }
    if (interaction.replied) {
        const sentMessage = await interaction.followUp(message);
        if (interaction.channelId) {
            return bot.client.getMessageFromChannel(interaction.channelId, sentMessage.id);
        }
    } else {
        await interaction.reply(message);
        if (interaction.channelId) {
            return bot.client.getMessageFromChannel(interaction.channelId, (await interaction.fetchReply()).id);
        }
    }
}

function ephemeralize(message: string | MessageOptions): InteractionReplyOptions {
    if (typeof message === "string") {
        return {
            content: message,
            ephemeral: true
        };
    } else {
        return {
            ...message as any,
            ephemeral: true
        }
    }
}
