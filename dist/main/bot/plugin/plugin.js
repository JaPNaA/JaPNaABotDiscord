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
    /** Registers a command handler */
    _registerDefaultCommand(name, callback, options) {
        this.bot.defaultPrecommand.commandManager.register(name, this._pluginName, callback.bind(this), options);
    }
    /** Adds a handler function to an event */
    _registerEventHandler(name, callback) {
        this.bot.events.on(name, callback.bind(this));
    }
    /** Adds a handler function to a precommand */
    _registerPrecommand(precommand, callback) {
        return this.bot.precommandManager.createAndRegister(precommand, callback.bind(this));
    }
}
exports.default = BotPlugin;
