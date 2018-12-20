"use strict";
/**
 * @typedef {import("./botHooks.js")} BotHooks
 * @typedef {"ready" | "start" | "stop" | "message" | "command" | "send" | "senddm" | "sent" | "beforememorywrite" | "aftermemorywrite" | "addasync" | "doneasync"} EventName
 */
const { tryRun } = require("../utils.js");
const Logger = require("../logger.js");
class BotEvent {
    /**
     * @param {BotHooks} botHooks
     */
    constructor(botHooks) {
        /**
         * All events and handlers
         * @type {Object.<string, Function[]>}
         */
        this.events = {
            "ready": [],
            "start": [],
            "stop": [],
            "message": [],
            "command": [],
            "send": [],
            "senddm": [],
            "sent": [],
            "beforememorywrite": [],
            "aftermemorywrite": [],
            "addasync": [],
            "doneasync": []
        };
        /** @type {BotHooks} */
        this.botHooks = botHooks;
    }
    /**
     * Adds event listener
     * @param {EventName} name name of event
     * @param {Function} func handler/callback function
     */
    on(name, func) {
        this.events[name].push(func);
    }
    /**
     * Call all event handlers for event
     * @param {EventName} name of event
     * @param {*} event Event data sent with dispatch
     * @returns {String[]} errors that have occured, can be empty
     */
    dispatch(name, event) {
        /** @type {String[]} */
        let errors = [];
        for (let handler of this.events[name]) {
            let error = tryRun(() => handler(this.botHooks, event));
            if (error) {
                errors.push(error);
                Logger.warn(error);
            }
        }
        return errors;
    }
}
module.exports = BotEvent;
