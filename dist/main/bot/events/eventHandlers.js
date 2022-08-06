"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventHandlers = void 0;
const logger_1 = __importDefault(require("../../utils/logger"));
const removeFromArray_1 = __importDefault(require("../../utils/removeFromArray"));
const tryRun_1 = __importDefault(require("../../utils/tryRun"));
class EventHandlers {
    highPriorityHandlers = [];
    lowPriorityHandlers = [];
    addHandler(handler) {
        this.lowPriorityHandlers.push(handler);
    }
    addHighPriorityHandler(handler) {
        this.highPriorityHandlers.push(handler);
    }
    removeHandler(handler) {
        (0, removeFromArray_1.default)(this.lowPriorityHandlers, handler);
    }
    removeHighPriorityHandler(handler) {
        (0, removeFromArray_1.default)(this.highPriorityHandlers, handler);
    }
    async dispatch(data) {
        await this.runEventHandlerArr(this.highPriorityHandlers, data);
        await this.runEventHandlerArr(this.lowPriorityHandlers, data);
    }
    async runEventHandlerArr(arr, data) {
        const errors = [];
        const promises = [];
        logger_1.default.log_message("Event: " + data);
        for (const handler of arr) {
            promises.push((0, tryRun_1.default)(() => handler(data))
                .then(error => {
                if (error) {
                    errors.push(error);
                    logger_1.default.warn(error);
                }
            }));
        }
        await Promise.all(promises);
        return errors;
    }
}
exports.EventHandlers = EventHandlers;
