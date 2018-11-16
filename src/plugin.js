/**
 * @typedef {import("./bot.js")} Bot
 */

class BotPlugin {
    /**
     * BotPlugin constrcutor
     * @param {Bot} bot parent bot
     */
    constructor(bot) {
        /** @type {Bot} */
        this.bot = bot;

        /** 
         * All events and handlers
         * @type {Object.<string, Function[]>}
         */
        this._events = {
            "message": [],
            "command": [],
            "send": [],
            "start": [],
            "beforememorywrite": []
        };
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
     */
    _registerCommand(name, func) {
        this.bot.registerCommand(name, func.bind(this));
    }

    /**
     * Adds a handler function to an event
     * @param {String} name of event to register to
     * @param {Function} func handler/callback function
     */
    _registerEventHandler(name, func) {
        this._events[name].push(func);
    }

    /**
     * Call all event handlers for event
     * @param {String} name of event
     * @param {*} event Event data sent with dispatch
     */
    _dispatchEvent(name, event) {
        for (let handler of this._events[name]) {
            handler.call(this, this.bot, event);
        }
    }
}

module.exports = BotPlugin;