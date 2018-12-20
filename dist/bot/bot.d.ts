/**
 * @typedef {import("discord.js").Client} Client
 * @typedef {import("discord.js").Channel} Channel
 * @typedef {import("discord.js").TextChannel} TextChannel
 * @typedef {import("discord.js").Message} Message
 * @typedef {import("discord.js").User} User
 * @typedef {import("../botcommandOptions.js")} BotCommandOptions
 * @typedef {import("../plugin.js")} Plugin
 * @typedef {import("../botcommandHelp.js")} BotCommandHelp
 * @typedef {import("../precommand.js")} Precommand
 * @typedef {import("../events.js").DiscordMessageEvent} DiscordMessageEvent
 * @typedef {import("../events.js").DiscordCommandEvent} DiscordCommandEvent
 */
declare const Logger: any;
declare const BotCommandOptions: any;
declare const RawEventAdapter: any;
declare const BotHooks: any;
declare const BotConfig: any;
declare const BotMemory: any;
declare const BotPermissions: any;
declare const BotEvents: any;
declare const CommandManager: any;
declare const BotClient: any;
declare class Bot {
    /**
     * Bot constructor
     * @param {Object} config bot config
     * @param {Object} memory bot memory
     * @param {String} memoryPath path to memory
     * @param {Client} client client
     * @param {Function} restartFunc restarting function
     */
    constructor(config: any, memory: any, memoryPath: any, client: any, restartFunc: any);
    /**
     * Add new asnyc request to wait for
     */
    newAsyncRequest(): void;
    /**
     * Remove asnyc request to wait for
     */
    doneAsyncRequest(): void;
    /**
     * Checks if there're more active asnyc requests
     * @returns {Boolean}
     */
    hasActiveAsyncRequests(): boolean;
    /**
     * Starts the bot
     */
    start(): void;
    registerCommandsAndPrecommands(): void;
    /**
     * Stops the bot (async)
     */
    stop(): void;
    /**
     * Restarts bot on command
     * @param {BotHooks} bot this
     * @param {DiscordMessageEvent} event data
     */
    restart(bot: any, event: any): void;
    /**
     * ready callback
     */
    onReady(): void;
    /**
     * called on command by onmessage
     * @param {DiscordCommandEvent} commandEvent message information
     */
    onBotPrecommandCommand(commandEvent: any): void;
}
