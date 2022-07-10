/// <reference types="node" />
import DiscordMessageEvent from "../main/bot/events/discordCommandEvent";
import BotPlugin from "../main/bot/plugin/plugin.js";
import Bot from "../main/bot/bot/bot";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent";
declare type SpamCallback = () => Promise<boolean>;
/**
 * Commonly used commands made by me, JaPNaA
 */
declare class Japnaa extends BotPlugin {
    counter: number;
    /** Que of spam functions */
    spamQue: {
        [x: string]: SpamCallback[];
    };
    /** Spam setInterval return */
    spamInterval: NodeJS.Timeout | null;
    /** Last-used `random` command arguments per channel */
    lastRandomCommands: Map<string, string>;
    userConfigSchema: {
        "spam.limit": {
            type: string;
            default: number;
            comment: string;
        };
        "spam.queLimit": {
            type: string;
            default: number;
            comment: string;
        };
    };
    constructor(bot: Bot);
    /**
     * makes the bot count
     */
    count(event: DiscordMessageEvent): void;
    /**
     * Safe eval command
     */
    sev(event: DiscordCommandEvent): void;
    private _sendJSCodeBlock;
    /**
     * says whatever you say
     */
    echo(event: DiscordCommandEvent): Promise<void>;
    /**
     * Generates random stuff
     */
    random(event: DiscordCommandEvent): Promise<import("discord.js").Message<boolean> | import("discord.js").Message<boolean>[] | undefined>;
    private random_string;
    private random_select;
    private random_again;
    private _parseFloatWithDefault;
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
    _getSpamLimit(event: DiscordMessageEvent): Promise<number>;
    /**
     * Gets the spam limit que for server and user
     */
    _getSpamQueLimit(event: DiscordMessageEvent): Promise<number>;
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
     * Tell someone something through DMs
     * @param args message to send
     */
    tell(event: DiscordCommandEvent): Promise<void>;
    /**
     * Create a thread and pretend to recieve the message in the thread
     */
    thread(event: DiscordCommandEvent): Promise<void>;
    _stop(): void;
    _start(): void;
}
export default Japnaa;
