import BotHooks from "../bot/botHooks.js";
import { Message } from "discord.js";
declare class RawEventAdapter {
    [x: string]: any;
    /**
     * @param {BotHooks} botHooks
     */
    constructor(botHooks: BotHooks);
    /**
     * When receiving raw messages
     * @param {Message} message of sender
     */
    onMessage(message: Message): void;
    onReady(): void;
}
export default RawEventAdapter;
