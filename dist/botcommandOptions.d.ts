/**
 * @typedef {import("./botcommandHelp.js")} BotCommandHelp
 */
declare class BotCommandOptions {
    /**
     * BotCommandOptions
     * @param {Object} options command triggering options
     * @param {String} [options.requiredPermission] required permission to run command
     * @param {Boolean} [options.noDM] prevent use of command in DMs
     * @param {BotCommandHelp} [options.help] help for the command
     * @param {String} [options.group] command group
     */
    constructor(options: any);
}
