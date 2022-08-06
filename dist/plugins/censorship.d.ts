import DiscordMessageEvent from "../main/bot/events/discordMessageEvent";
import BotPlugin from "../main/bot/plugin/plugin.js";
import Bot from "../main/bot/bot/bot";
import { EventControls } from "../main/bot/events/eventHandlers";
import { MessageOptions } from "discord.js";
/**
 * Keep channels 'clean,' and get rid free speech.
 */
declare class Censorship extends BotPlugin {
    userConfigSchema: {
        enabled: {
            type: string;
            comment: string;
            default: boolean;
        };
        deleteCensoredMessages: {
            type: string;
            comment: string;
            default: boolean;
        };
        alertSenderCensor: {
            type: string;
            comment: string;
            default: boolean;
        };
        targets: {
            type: string;
            comment: string;
            default: string[];
        };
    };
    constructor(bot: Bot);
    messageHandler(event: DiscordMessageEvent, eventControls: EventControls): Promise<void>;
    sendMessageHandler({ channelId, content }: {
        channelId: string;
        content: string | MessageOptions;
    }, eventControls: EventControls): Promise<void>;
    _isUserMessage(bot: Bot, event: DiscordMessageEvent): Promise<boolean>;
    _start(): void;
    _stop(): void;
}
export default Censorship;
