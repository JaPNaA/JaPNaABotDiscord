/// <reference types="node" />
import BotHooks from "../main/bot/bot/botHooks.js";
import DiscordMessageEvent from "../main/bot/events/discordCommandEvent";
import BotPlugin from "../main/bot/plugin/plugin.js";
import { JSONObject } from "../main/types/jsonObject.js";
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
    constructor(bot: BotHooks);
    /**
     * makes the bot count
     */
    count(bot: BotHooks, event: DiscordMessageEvent): void;
    /**
     * says whatever you say
     */
    echo(bot: BotHooks, event: DiscordMessageEvent, args: string): void;
    /**
     * Generates random stuff
     */
    random(bot: BotHooks, event: DiscordMessageEvent, argString: string): void;
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
    _getSpamLimit(bot: BotHooks, event: DiscordMessageEvent): number;
    /**
     * Gets the spam limit que for server and user
     */
    _getSpamQueLimit(bot: BotHooks, event: DiscordMessageEvent): number;
    /**
     * Actual spam function
     */
    _spam(bot: BotHooks, channelId: string, serverId: string, amount: number, counter: boolean, message: string): void;
    /**
     * Makes the bot spam stuff
     * @param args "stop" | [amount, [counter], ...message]
     */
    spam_command(bot: BotHooks, event: DiscordMessageEvent, args: string): void;
    /**
     * Throws an error
     * @param args error message
     */
    throw(bot: BotHooks, event: DiscordMessageEvent, args: string): void;
    /**
     * Changes rich presence to play a game
     * @param args string to set as play
     */
    play(bot: BotHooks, event: DiscordMessageEvent, args: string): void;
    /**
     * Changes rich presence to watch a game
     * @param args string to set as watch
     */
    watch(bot: BotHooks, event: DiscordMessageEvent, args: string): void;
    /**
     * Changes rich presence to listen to a music
     * @param args string to set as music
     */
    listen_to(bot: BotHooks, event: DiscordMessageEvent, args: string): void;
    /**
     * Changes rich presence to stream a game
     * @param args string to set as stream
     */
    stream(bot: BotHooks, event: DiscordMessageEvent, args: string): void;
    /**
     * Tell someone something through DMs
     * @param args message to send
     */
    tell(bot: BotHooks, event: DiscordMessageEvent, args: string): void;
    _stop(): void;
    _start(): void;
}
export default Japnaa;
