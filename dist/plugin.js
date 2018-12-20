"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BotPlugin {
    constructor(bot) {
        this.bot = bot;
        this._pluginName = this.constructor.name.toLowerCase();
    }
    /**
     * Starts the plugin
     */
    _start() { }
    /**
     * Stops the plugin
     */
    _stop() { }
    /**
     * Registers an command handler
     * @param {String} name of command, called by [precommand][name]
     * @param {Function} func function to run when called
     * @param {BotCommandOptions} [options] permission that is required to run command
     */
    _registerCommand(name, func, options) {
        this.bot.commandManager.register.command(name, this._pluginName, func.bind(this), options);
    }
    /**
     * Adds a handler function to an event
     * @param name of event to register to
     * @param func handler/callback function
     */
    _registerEventHandler(name, func) {
        this.bot.events.on(name, func.bind(this));
    }
    /**
     * Adds a handler function to a precommand
     * @param precommand precommmand to handle
     * @param func function to call when precommand is triggered
     */
    _registerPrecommandHander(precommand, func) {
        this.bot.commandManager.register.precommand(precommand, func.bind(this));
    }
}
exports.default = BotPlugin;
