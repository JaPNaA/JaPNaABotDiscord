/**
 * @typedef {import("../botHooks.js")} BotHooks
 * @typedef {import("../../botcommandOptions")} BotCommandOptions
 * @typedef {import("../../botcommandHelp.js")} BotCommandHelp
 * @typedef {import("../../botcommand.js")} BotCommand
 * @typedef {import("../../precommand")} Precommand
 * @typedef {import("../../plugin.js")} Plugin
 */
declare const CommandRegistar: any;
declare const CommandDispatcher: any;
declare class CommandManager {
    constructor(botHooks: any);
    /**
     * Gets help for command
     * @param {String} command command name
     */
    getHelp(command: any): any;
    /**
     * checks if message starts with a precommand
     * @param {String} message
     * @returns {Precommand}
     */
    getFirstPrecommand(message: any): any;
}
