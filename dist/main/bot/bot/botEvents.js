"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tryRun_1 = __importDefault(require("../../utils/tryRun"));
const logger_js_1 = __importDefault(require("../../utils/logger.js"));
class BotEvent {
    constructor(bot) {
        this.bot = bot;
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
    }
    on(name, func) {
        this.events[name].push(func);
    }
    dispatch(name, event) {
        let errors = [];
        logger_js_1.default.log_message("Event: " + name);
        for (let handler of this.events[name]) {
            let error = tryRun_1.default(() => handler(this.bot, event));
            if (error) {
                errors.push(error);
                logger_js_1.default.warn(error);
            }
        }
        return errors;
    }
}
exports.default = BotEvent;
