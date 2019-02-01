import BotHooks from "../bot/bot/botHooks.js";
import IMessage from "./IMessage.js";
declare class RawEventAdapter {
    botHooks: BotHooks;
    constructor(botHooks: BotHooks);
    /**
     * When receiving raw messages
     * @param message of sender
     */
    onMessage(message: IMessage): void;
    onReady(): void;
}
export default RawEventAdapter;
