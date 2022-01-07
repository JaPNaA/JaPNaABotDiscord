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
    async dispatch(name, event) {
        const errors = [];
        const promises = [];
        logger_js_1.default.log_message("Event: " + name);
        for (let handler of this.events[name]) {
            promises.push(tryRun_1.default(() => handler(event))
                .then(error => {
                if (error) {
                    errors.push(error);
                    logger_js_1.default.warn(error);
                }
            }));
        }
        await Promise.all(promises);
        return errors;
    }
}
exports.default = BotEvent;
