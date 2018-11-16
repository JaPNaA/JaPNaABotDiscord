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

        /** @type {Object.<string, Function[]>} */
        this._events = {
            "message": [],
            "command": [],
            "send": [],
            "start": [],
            "beforememorywrite": []
        };
    }
    _start() {}
    _stop() {}
    _registerCommand(name, func) {
        this.bot.registerCommand(name, func.bind(this));
    }
    _registerEventHandler(name, func) {
        this._events[name].push(func);
    }
    _dispatchEvent(name, event) {
        for (let handler of this._events[name]) {
            handler.call(this, this.bot, event);
        }
    }
}

module.exports = BotPlugin;