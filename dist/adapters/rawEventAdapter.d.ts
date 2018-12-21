import BotHooks from "../bot/botHooks.js";
import { Message } from "discord.js";
/**
 * @typedef {import("discord.js").TextChannel} TextChannel
 * @typedef {import("discord.js").Message} Message
 *
 * @typedef {import("../bot/botHooks.js")} BotHooks
 */
declare class RawEventAdapter {
    botHooks: BotHooks;
    constructor(botHooks: BotHooks);
    /**
     * When receiving raw messages
     * @param {Message} message of sender
     */
    onMessage(message: Message): void;
    onReady(): void;
}
export default RawEventAdapter;
