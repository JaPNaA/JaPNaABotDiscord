import { MessageCreateOptions } from "discord.js";
import DiscordCommandEvent from "../events/discordCommandEvent.js";
import DiscordMessageEvent from "../events/discordMessageEvent.js";
import { EventHandlers } from "../events/eventHandlers.js";
import IMessageObject from "../types/messageObject.js";
import Bot from "./bot.js";
declare class BotEvent {
    ready: EventHandlers<void>;
    start: EventHandlers<void>;
    stop: EventHandlers<void>;
    message: EventHandlers<DiscordMessageEvent>;
    command: EventHandlers<DiscordCommandEvent>;
    send: EventHandlers<{
        channelId: string;
        content: string | MessageCreateOptions;
    }>;
    sendDM: EventHandlers<{
        userId: string;
        content: string | IMessageObject;
    }>;
    sent: EventHandlers<DiscordMessageEvent>;
    beforeMemoryWrite: EventHandlers<void>;
    afterMemoryWrite: EventHandlers<void>;
    addAsync: EventHandlers<number>;
    doneAsync: EventHandlers<number>;
    constructor(bot: Bot);
}
export default BotEvent;
