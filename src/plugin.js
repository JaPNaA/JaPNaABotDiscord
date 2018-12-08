/**
 * @typedef {import("./bot.js")} Bot
 * @typedef {import("./botcommandOptions.js")} BotCommandOptions
 */

class BotPlugin {
    /**
     * BotPlugin constrcutor
     * @param {Bot} bot parent bot
     */
    constructor(bot) {
        /** @type {Bot} */
        this.bot = bot;
        this._pluginName = this.constructor.name.toLowerCase();
    }

    /**
     * Starts the plugin
     */
    _start() {}

    /**
     * Stops the plugin
     */
    _stop() {}

    /**
     * Registers an command handler
     * @param {String} name of command, called by [precommand][name]
     * @param {Function} func function to run when called
     * @param {BotCommandOptions} [options] permission that is required to run command
     */
    _registerCommand(name, func, options) {
        this.bot.registerCommand(name, this._pluginName, func.bind(this), options);
    }

    /**
     * Adds a handler function to an event
     * @param {String} name of event to register to
     * @param {Function} func handler/callback function
     */
    _registerEventHandler(name, func) {
        this.bot.addEventListener(name, func.bind(this));
    }
}

module.exports = BotPlugin;