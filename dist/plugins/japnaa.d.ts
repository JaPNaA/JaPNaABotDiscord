/// <reference types="node" />
import DiscordMessageEvent from "../main/bot/events/discordCommandEvent";
import BotPlugin from "../main/bot/plugin/plugin.js";
import { JSONObject } from "../main/types/jsonObject.js";
import Bot from "../main/bot/bot/bot";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent";
declare type SpamCallback = () => Promise<boolean>;
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
    config: JSONObject;
    constructor(bot: Bot);
    /**
     * makes the bot count
     */
    count(event: DiscordMessageEvent): void;
    /**
     * says whatever you say
     */
    echo(event: DiscordCommandEvent): Promise<void>;
    /**
     * Generates random stuff
     */
    random(event: DiscordMessageEvent): void;
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
    _sendSpam(): Promise<void>;
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
    spam_command(event: DiscordCommandEvent): Promise<void>;
    /**
     * Throws an error
     * @param args error message
     */
    throw(event: DiscordCommandEvent): void;
    /**
     * Changes rich presence to play a game
     * @param args string to set as play
     */
    play(event: DiscordCommandEvent): void;
    /**
     * Changes rich presence to watch a game
     * @param args string to set as watch
     */
    watch(event: DiscordCommandEvent): void;
    /**
     * Changes rich presence to listen to a music
     * @param args string to set as music
     */
    listen_to(event: DiscordCommandEvent): void;
    /**
     * Changes rich presence to stream a game
     * @param args string to set as stream
     */
    stream(event: DiscordCommandEvent): void;
    /**
     * Tell someone something through DMs
     * @param args message to send
     */
    tell(event: DiscordCommandEvent): void;
    _stop(): void;
    _start(): void;
}
export default Japnaa;
