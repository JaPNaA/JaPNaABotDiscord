/**
 * @typedef {import("../dist/events.js").DiscordCommandEvent} DiscordCommandEvent
 * @typedef {import("./bot/botHooks.js")} BotHooks
 * @typedef {import("./botcommandOptions.js")} BotCommandOptions
 * @typedef {import("./botcommandHelp.js")} BotCommandHelp
 */
/**
 * @callback BotCommandCallback
 * @param {BotHooks} bot
 * @param {DiscordCommandEvent} event
 * @param {String} args
 */
declare const Logger: any;
declare const createErrorString: any;
declare const inspect: any;
declare class BotCommand {
    /**
     * BotCommand constructor
     * @param {BotHooks} bot bot
     * @param {String} commandName command name
     * @param {BotCommandCallback} func function to call
     * @param {BotCommandOptions} [options] command triggering options
     */
    constructor(bot: any, commandName: any, pluginName: any, func: any, options: any);
    /**
     * @typedef {Object} CleanCommandContent
     * @property {String} commandContent command trimmed
     * @property {String} args arguments
     * @property {String} nextCharAfterCommand next character after the command
     */
    /**
     * Returns cleaned command content
     * @param {String} dirtyContent dirty content to be cleaned
     * @returns {CleanCommandContent} cleaned command content
     */
    _getCleanCommandContent(dirtyContent: any): {
        commandContent: any;
        args: any;
        nextCharAfterCommand: any;
    };
    /**
     * @typedef {Object} TestResults
     * @property {Boolean} canRun can the command run?
     * @property {String} [reasonCannotRun] reason why the command cannot run
     */
    /**
     * Tests if command can be run
     * @param {DiscordCommandEvent} commandEvent the event to test
     * @returns {TestResults} Error string
     */
    test(commandEvent: any): {
        canRun: boolean;
        reasonCannotRun: string;
    } | {
        canRun: boolean;
        reasonCannotRun?: undefined;
    };
    /**
     * Tests if the commandWord matches, and runs the command if it does.
     * @param {DiscordCommandEvent} commandEvent the event triggering function
     * @returns {Boolean} Did the command run OR not have enough permissions to run
     */
    testAndRun(commandEvent: any): boolean;
    /**
     * Sends an error message
     * @param {DiscordCommandEvent} commandEvent command event
     * @param {String} argString arguments as string
     * @param {Error} error error to send
     */
    sendError(commandEvent: any, argString: any, error: any): void;
    /**
     * Tries to run command, and sends an error message if fails
     * @param {DiscordCommandEvent} commandEvent command event
     * @param {String} argString arguments as string
     */
    tryRunCommand(commandEvent: any, argString: any): void;
}
