import IMessage from "./IMessage.js";
import Bot from "../bot/bot/bot";
declare class RawEventAdapter {
    private bot;
    constructor(bot: Bot);
    /**
     * When receiving raw messages
     * @param message of sender
     */
    onMessage(message: IMessage): void;
    onReady(): void;
}
export default RawEventAdapter;
