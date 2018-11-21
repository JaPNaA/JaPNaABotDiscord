/**
 * @typedef {import("./botcommandHelp.js")} BotCommandHelp
 */

class BotCommandOptions {
    /**
     * BotCommandOptions
     * @param {Object} options command triggering options
     * @param {String} [options.requiredPermission] required permission to run command
     * @param {Boolean} [options.noDM] prevent use of command in DMs
     * @param {BotCommandHelp} [options.help] help for the command
     */
    constructor(options) {
        this.requiredPermission = options.requiredPermission;
        this.noDM = options.noDM;
        this.help = options.help;
    }
}

module.exports = BotCommandOptions;