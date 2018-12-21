/// <reference types="node" />
import BotHooks from "../bot/botHooks.js";
import { DiscordMessageEvent } from "../events.js";
import BotPlugin from "../plugin.js";
import { JSONObject } from "../jsonObject.js";
/**
 * Commonly used commands made by me, JaPNaA
 */
declare class Japnaa extends BotPlugin {
    memorySpamLimit: string;
    counter: number;
    /** Que of spam functions */
    spamQue: {
        [x: string]: Function[];
    };
    /** Spam setInterval return */
    spamInterval: NodeJS.Timeout | null;
    /** Is the spam interval active? */
    spamIntervalActive: boolean;
    config: JSONObject;
    constructor(bot: BotHooks);
    /**
     * makes the bot count
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     */
    count(bot: BotHooks, event: DiscordMessageEvent): void;
    /**
     * says whatever you say
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args what to echo back
     */
    echo(bot: BotHooks, event: DiscordMessageEvent, args: string): void;
    /**
     * Generates a 128 character radom string
     */
    _randomString(): string;
    /**
     * Generates random stuff
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} argString arguments [min, max, step] | "String"
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
     * @param {String} serverId
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
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     * @returns {Number} spam limit
     */
    _getSpamLimit(bot: BotHooks, event: DiscordMessageEvent): number;
    /**
     * Gets the spam limit que for server and user
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     */
    _getSpamQueLimit(bot: BotHooks, event: DiscordMessageEvent): any;
    /**
     * Actual spam function
     * @param {BotHooks} bot bot
     * @param {String} channelId id of channel
     * @param {String} serverId id of server
     * @param {Number} amount number of messages to spam
     * @param {Boolean} counter use counter?
     * @param {String} message spam message
     */
    _spam(bot: BotHooks, channelId: string, serverId: string, amount: number, counter: boolean, message: string): void;
    /**
     * Makes the bot spam stuff
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args "stop" | [amount, [counter], ...message]
     */
    spam_command(bot: BotHooks, event: DiscordMessageEvent, args: string): void;
    /**
     * Throws an error
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args Error message
     */
    throw(bot: BotHooks, event: DiscordMessageEvent, args: string): void;
    /**
     * Changes rich presence to play a game
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args string to set as play
     */
    play(bot: BotHooks, event: DiscordMessageEvent, args: string): void;
    /**
     * Changes rich presence to play a game
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args string to set as play
     */
    watch(bot: BotHooks, event: DiscordMessageEvent, args: string): void;
    /**
     * Changes rich presence to play a game
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args string to set as play
     */
    listen_to(bot: BotHooks, event: DiscordMessageEvent, args: string): void;
    /**
     * Changes rich presence to play a game
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args string to set as play
     */
    stream(bot: BotHooks, event: DiscordMessageEvent, args: string): void;
    /**
     * Tell someone something through DMs
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args message to send
     */
    tell(bot: BotHooks, event: DiscordMessageEvent, args: string): void;
    _stop(): void;
    _start(): void;
}
export default Japnaa;
