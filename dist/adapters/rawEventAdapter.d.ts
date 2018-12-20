/**
 * @typedef {import("discord.js").TextChannel} TextChannel
 * @typedef {import("discord.js").Message} Message
 *
 * @typedef {import("../bot/botHooks.js")} BotHooks
 */
declare const DiscordMessageEvent: any;
declare class RawEventAdapter {
    /**
     * @param {BotHooks} botHooks
     */
    constructor(botHooks: any);
    /**
     * When receiving raw messages
     * @param {Message} message of sender
     */
    onMessage(message: any): void;
    onReady(): void;
}
