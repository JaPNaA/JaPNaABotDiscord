/// <reference types="node" />
import DiscordMessageEvent from "../main/bot/events/discordCommandEvent";
import BotPlugin from "../main/bot/plugin/plugin.js";
import { JSONObject } from "../main/types/jsonObject.js";
import Bot from "../main/bot/bot/bot";
declare type SpamCallback = () => boolean;
/**
 * Commonly used commands made by me, JaPNaA
 */
declare class Japnaa extends BotPlugin {
    memorySpamLimit: string;
    counter: number;
    /** Que of spam functions */
    spamQue: {
        [x: string]: SpamCallback[];
    };
    /** Spam setInterval return */
    spamInterval: NodeJS.Timeout | null;
    /** Is the spam interval active? */
    spamIntervalActive: boolean;
    config: JSONObject;
    constructor(bot: Bot);
    /**
     * makes the bot count
     */
    count(bot: Bot, event: DiscordMessageEvent): void;
    /**
     * says whatever you say
     */
    echo(bot: Bot, event: DiscordMessageEvent, args: string): void;
    /**
     * Generates random stuff
     */
    random(bot: Bot, event: DiscordMessageEvent, argString: string): void;
    /**
     * Begins spamming from spam que with interval
     */
    _startSpam(): void;
    /**
     * Checks if the spam interval should be running or not
     */
    _checkSpamInterval(): void;
    /**
     * Stops spamming
     */
    _stopSpam(serverId: string): void;
    /**
     * Stops all spam
     */
    _stopAllSpam(): void;
    /**
     * Send spam, triggered by interval, by que
     */
    _sendSpam(): void;
    /**
     * Gets the spam limit for channel and user
     */
    _getSpamLimit(bot: Bot, event: DiscordMessageEvent): number;
    /**
     * Gets the spam limit que for server and user
     */
    _getSpamQueLimit(bot: Bot, event: DiscordMessageEvent): Promise<number>;
    /**
     * Actual spam function
     */
    _spam(bot: Bot, channelId: string, serverId: string, amount: number, counter: boolean, message: string): void;
    /**
     * Makes the bot spam stuff
     * @param args "stop" | [amount, [counter], ...message]
     */
    spam_command(bot: Bot, event: DiscordMessageEvent, args: string): Promise<void>;
    /**
     * Throws an error
     * @param args error message
     */
    throw(bot: Bot, event: DiscordMessageEvent, args: string): void;
    /**
     * Changes rich presence to play a game
     * @param args string to set as play
     */
    play(bot: Bot, event: DiscordMessageEvent, args: string): void;
    /**
     * Changes rich presence to watch a game
     * @param args string to set as watch
     */
    watch(bot: Bot, event: DiscordMessageEvent, args: string): void;
    /**
     * Changes rich presence to listen to a music
     * @param args string to set as music
     */
    listen_to(bot: Bot, event: DiscordMessageEvent, args: string): void;
    /**
     * Changes rich presence to stream a game
     * @param args string to set as stream
     */
    stream(bot: Bot, event: DiscordMessageEvent, args: string): void;
    /**
     * Tell someone something through DMs
     * @param args message to send
     */
    tell(bot: Bot, event: DiscordMessageEvent, args: string): void;
    _stop(): void;
    _start(): void;
}
export default Japnaa;
