import BotHooks from "../bot/botHooks.js";
import { Message } from "discord.js";
declare class RawEventAdapter {
    botHooks: BotHooks;
    constructor(botHooks: BotHooks);
    /**
     * When receiving raw messages
     * @param message of sender
     */
    onMessage(message: Message): void;
    onReady(): void;
}
export default RawEventAdapter;
