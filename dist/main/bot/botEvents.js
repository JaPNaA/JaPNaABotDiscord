"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_js_1 = require("../utils.js");
const logger_js_1 = __importDefault(require("../logger.js"));
class BotEvent {
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
        let errors = [];
        for (let handler of this.events[name]) {
            let error = utils_js_1.tryRun(() => handler(this.botHooks, event));
            if (error) {
                errors.push(error);
                logger_js_1.default.warn(error);
            }
        }
        return errors;
    }
}
exports.default = BotEvent;
