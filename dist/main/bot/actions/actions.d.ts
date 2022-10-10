import { AllowedThreadTypeForTextChannel, CacheType, Interaction, Message, MessageOptions, ThreadChannel, ThreadCreateOptions } from "discord.js";
import Bot from "../bot/bot";
import DiscordMessageEvent from "../events/discordMessageEvent";
export declare abstract class Action {
    abstract perform(bot: Bot, event: DiscordMessageEvent): Promise<any>;
    abstract performInteraction(bot: Bot, interaction: Interaction): Promise<any>;
}
declare abstract class Reply extends Action {
    message: string | MessageOptions;
    protected sentMessage?: Message | Message[];
    constructor(message: string | MessageOptions);
    getMessage(): Message;
    protected send(bot: Bot, channelId: string): Promise<void>;
}
/**
 * Replies to a message. 'Soft' means the bot will not always use the 'reply'
 * function unless necessary.
 *
 * Intended for general response messages
 */
export declare class ReplySoft extends Reply {
    perform(bot: Bot, event: DiscordMessageEvent): Promise<any>;
    performInteraction(bot: Bot, interaction: Interaction): Promise<void>;
}
/**
 * Replies to a message privately. Only the runner will
 * see the message.
 *
 * Intended for sending private information
 */
export declare class ReplyPrivate extends Reply {
    perform(bot: Bot, event: DiscordMessageEvent): Promise<any>;
    performInteraction(bot: Bot, interaction: Interaction<CacheType>): Promise<any>;
}
/**
 * Replies to a message. Will hide the message from others
 * if convenient for the user.
 *
 * Intended for error messages, 'empty' messages, messages everyone
 * doesn't need to see.
 */
export declare class ReplyUnimportant extends Reply {
    perform(bot: Bot, event: DiscordMessageEvent): Promise<any>;
    performInteraction(bot: Bot, interaction: Interaction<CacheType>): Promise<any>;
}
/**
 * Sends a message in a channel.
 *
 * Intended for messages not triggered by a command directly.
 * Ex. reminders, routine messages, announcements, etc.
 */
export declare class Send extends Action {
    channelId: string;
    message: string | MessageOptions;
    constructor(channelId: string, message: string | MessageOptions);
    perform(bot: Bot): Promise<any>;
    performInteraction(bot: Bot, interaction: Interaction<CacheType>): Promise<any>;
}
/**
 * Sends a message to a user privately (through DMs)
 *
 * Intended for private messages not triggered by a command directly.
 * Ex. reminders, routine messages, announcements, etc.
 */
export declare class SendPrivate extends Action {
    userId: string;
    message: string | MessageOptions;
    constructor(userId: string, message: string | MessageOptions);
    perform(bot: Bot): Promise<any>;
    performInteraction(bot: Bot, interaction: Interaction<CacheType>): Promise<any>;
}
/**
 * Creates a thread. 'Soft' means the bot may not create the thread if
 * not possible without throwing an error.
 */
export declare class ReplyThreadSoft extends Action {
    threadName: string;
    private options;
    private thread?;
    constructor(threadName: string, options?: Partial<ThreadCreateOptions<AllowedThreadTypeForTextChannel>>);
    perform(bot: Bot, event: DiscordMessageEvent): Promise<any>;
    performInteraction(bot: Bot, interaction: Interaction<CacheType>): Promise<any>;
    private createThread;
    getThread(): ThreadChannel;
}
/**
 * Deletes a message. 'Soft' means the bot won't throw an error if
 * the bot cannot delete the message.
 */
export declare class DeleteMessageSoft extends Action {
    channelId: string;
    messageId: string;
    constructor(channelId: string, messageId: string);
    perform(bot: Bot): Promise<any>;
    performInteraction(bot: Bot): Promise<any>;
}
export {};
