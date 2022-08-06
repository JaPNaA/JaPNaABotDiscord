import { MessageOptions } from "discord.js";
import DiscordCommandEvent from "../events/discordCommandEvent.js";
import DiscordMessageEvent from "../events/discordMessageEvent.js";
import { EventHandlers } from "../events/eventHandlers.js";
import IMessageObject from "../types/messageObject.js";
import Bot from "./bot.js";

class BotEvent {
    public ready = new EventHandlers();
    public start = new EventHandlers();
    public stop = new EventHandlers();

    public message = new EventHandlers<DiscordMessageEvent>();
    public command = new EventHandlers<DiscordCommandEvent>();

    public send = new EventHandlers<string | MessageOptions>();
    public sendDM = new EventHandlers<string | IMessageObject>();
    public sent = new EventHandlers<DiscordMessageEvent>();

    public beforeMemoryWrite = new EventHandlers();
    public afterMemoryWrite = new EventHandlers();

    public addAsync = new EventHandlers<number>();
    public doneAsync = new EventHandlers<number>();

    constructor(bot: Bot) { }
}

export default BotEvent;