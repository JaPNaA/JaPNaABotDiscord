/**
 * @typedef {import("../dist/bot/botEvents.js").EventName} EventName

 * @typedef {import("./bot/botHooks.js")} BotHooks
 * @typedef {import("./botcommandOptions.js")} BotCommandOptions
 */
declare class BotPlugin {
    /**
     * BotPlugin constrcutor
     * @param {BotHooks} bot parent bot
     */
    constructor(bot: any);
    /**
     * Starts the plugin
     */
    _start(): void;
    /**
     * Stops the plugin
     */
    _stop(): void;
    /**
     * Registers an command handler
     * @param {String} name of command, called by [precommand][name]
     * @param {Function} func function to run when called
     * @param {BotCommandOptions} [options] permission that is required to run command
     */
    _registerCommand(name: any, func: any, options: any): void;
    /**
     * Adds a handler function to an event
     * @param {EventName} name of event to register to
     * @param {Function} func handler/callback function
     */
    _registerEventHandler(name: any, func: any): void;
    /**
     * Adds a handler function to a precommand
     * @param {String} precommand precommmand to handle
     * @param {Function} func function to call when precommand is triggered
     */
    _registerPrecommandHander(precommand: any, func: any): void;
}
