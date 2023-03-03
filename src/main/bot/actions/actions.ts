import { AllowedThreadTypeForTextChannel, CacheType, GuildTextThreadCreateOptions, Interaction, InteractionReplyOptions, Message, Options as MessageOptions, TextChannel, ThreadChannel } from "discord.js";
import toOne from "../../utils/toOne";
import Bot from "../bot/bot";
import DiscordMessageEvent from "../events/discordMessageEvent";

export abstract class Action {
    public abstract perform(bot: Bot, event: DiscordMessageEvent): Promise<any>;
    public abstract performInteraction(bot: Bot, interaction: Interaction): Promise<any>;
}

abstract class Reply extends Action {
    protected sentMessage?: Message | Message[];

    constructor(
        public message: string | MessageOptions
    ) { super(); }

    public getMessage(): Message {
        if (!this.sentMessage) { throw new ActionNotYetPerformedError(); }
        return toOne(this.sentMessage);
    }

    protected async send(bot: Bot, channelId: string) {
        this.sentMessage = await bot.client.send(channelId, this.message);
    }
}

/**
 * Replies to a message. 'Soft' means the bot will not always use the 'reply'
 * function unless necessary.
 * 
 * Intended for general response messages
 */
export class ReplySoft extends Reply {
    public async perform(bot: Bot, event: DiscordMessageEvent): Promise<any> {
        // if the last message was the command, send message normally but
        // if last message is not the command message, reply to command message
        const channel = await bot.client.getChannel(event.channelId);
        if (channel?.isTextBased() && 'messages' in channel) {
            const lastMessage = channel.messages.cache.last();
            if (lastMessage && lastMessage.id !== event.messageId) {
                try {
                    // reply
                    this.sentMessage = await (await channel.messages.fetch(event.messageId)).reply(this.message);
                } catch (err) {
                    await this.send(bot, event.channelId);
                }
            } else {
                await this.send(bot, event.channelId);
            }
        } else {
            throw new Error("Channel <#" + event.channelId + "> is not a text channel, or does not have a messages attribute.");
        }
    }

    public async performInteraction(bot: Bot, interaction: Interaction) {
        if (interaction.isRepliable()) {
            this.sentMessage = await followUpOrReply(bot, interaction, this.message as any);
        } else if (interaction.channelId) {
            // send normally
            this.send(bot, interaction.channelId);
        } else {
            throw new Error("Cannot respond.");
        }
    }
}

/**
 * Replies to a message privately. Only the runner will
 * see the message.
 * 
 * Intended for sending private information
 */
export class ReplyPrivate extends Reply {
    public perform(bot: Bot, event: DiscordMessageEvent): Promise<any> {
        return bot.client.sendDM(event.userId, this.message);
    }

    public async performInteraction(bot: Bot, interaction: Interaction<CacheType>): Promise<any> {
        if (interaction.isRepliable()) {
            this.sentMessage = await followUpOrReply(bot, interaction, ephemeralize(this.message));
        } else {
            this.sentMessage = await bot.client.sendDM(interaction.user.id, this.message);
        }
    }
}

/**
 * Replies to a message. Will hide the message from others
 * if convenient for the user.
 * 
 * Intended for error messages, 'empty' messages, messages everyone
 * doesn't need to see.
 */
export class ReplyUnimportant extends Reply {
    public perform(bot: Bot, event: DiscordMessageEvent): Promise<any> {
        return this.send(bot, event.channelId);
    }

    public async performInteraction(bot: Bot, interaction: Interaction<CacheType>): Promise<any> {
        if (interaction.isRepliable()) {
            this.sentMessage = await followUpOrReply(bot, interaction, ephemeralize(this.message));
        } else if (interaction.channelId) {
            this.send(bot, interaction.channelId);
        } else {
            this.sentMessage = await bot.client.sendDM(interaction.user.id, this.message);
        }
    }
}

/**
 * Sends a message in a channel.
 * 
 * Intended for messages not triggered by a command directly.
 * Ex. reminders, routine messages, announcements, etc.
 */
export class Send extends Action {
    protected sentMessage?: Message | Message[];

    constructor(
        public channelId: string,
        public message: string | MessageOptions
    ) { super(); }

    public async perform(bot: Bot): Promise<any> {
        this.sentMessage = await bot.client.send(this.channelId, this.message);
    }

    public async performInteraction(bot: Bot, interaction: Interaction<CacheType>): Promise<any> {
        if (interaction.isRepliable() && this.channelId === interaction.channelId) {
            this.sentMessage = await followUpOrReply(bot, interaction, this.message as any);
        } else {
            return this.perform(bot);
        }
    }

    public getMessage(): Message {
        if (!this.sentMessage) { throw new ActionNotYetPerformedError(); }
        return toOne(this.sentMessage);
    }
}

/**
 * Sends a message to a user privately (through DMs)
 * 
 * Intended for private messages not triggered by a command directly.
 * Ex. reminders, routine messages, announcements, etc.
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
        private options: Partial<GuildTextThreadCreateOptions<AllowedThreadTypeForTextChannel>> = {}
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
        if (channel?.isTextBased() && 'messages' in channel) {
            await (channel.messages.fetch(this.messageId) as Promise<any>)
                .then(message => message.delete())
                .catch(_ => { });
        }
    }

    public async performInteraction(bot: Bot): Promise<any> {
        return this.perform(bot);
    }
}

/**
 * Reactions to a message with an emoji.
 */
export class React extends Action {
    constructor(
        public channelId: string,
        public messageId: string,
        public emoji: string
    ) { super(); }

    public async perform(bot: Bot): Promise<any> {
        const channel = await bot.client.getChannel(this.channelId);
        if (channel?.isTextBased() && 'messages' in channel) {
            await (await channel.messages.fetch(this.messageId)).react(this.emoji);
        }
    }

    public async performInteraction(bot: Bot): Promise<any> {
        return this.perform(bot);
    }
}

/**
 * Responds to a message with a reaction emoji.
 */
export class ReplyReact extends Action {
    constructor(public emoji: string) { super(); }

    public async perform(bot: Bot, event: DiscordMessageEvent): Promise<any> {
        const channel = await bot.client.getChannel(event.channelId);
        if (channel?.isTextBased() && 'messages' in channel) {
            try {
                await (await channel.messages.fetch(event.messageId)).react(this.emoji);
            } catch (err) {
                return new ReplyUnimportant(this.emoji).perform(bot, event);
            }
        }
    }

    public async performInteraction(bot: Bot, interaction: Interaction<CacheType>): Promise<any> {
        return new ReplyUnimportant(this.emoji).performInteraction(bot, interaction);
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
