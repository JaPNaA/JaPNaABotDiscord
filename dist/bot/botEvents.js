"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { tryRun } = require("../utils.js");
const Logger = require("../logger.js");
class BotEvent {
    /**
     * @param {BotHooks} botHooks
     */
    constructor(botHooks) {
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
        this.botHooks = botHooks;
    }
    on(name, func) {
        this.events[name].push(func);
    }
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
exports.default = BotEvent;
