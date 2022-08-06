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
    /**
     * Handlers called first
     */
    highPriorityHandlers = [];
    /**
     * Handlers called second.
     */
    normalHandlers = [];
    /**
     * System handlers, called third.
     * Not cancelled with `stopPropagation`, but cancelled by `preventSystemNext`.
     */
    systemHandlers = [];
    shouldStopPropagation = false;
    shouldPreventSystem = false;
    eventControls = {
        stopPropagation: () => this.shouldStopPropagation = true,
        preventSystemNext: () => this.shouldPreventSystem = true
    };
    addHandler(handler) {
        this.normalHandlers.push(handler);
    }
    addHighPriorityHandler(handler) {
        this.highPriorityHandlers.push(handler);
    }
    _addSystemHandler(handler) {
        this.systemHandlers.push(handler);
    }
    removeHandler(handler) {
        (0, removeFromArray_1.default)(this.normalHandlers, handler);
    }
    removeHighPriorityHandler(handler) {
        (0, removeFromArray_1.default)(this.highPriorityHandlers, handler);
    }
    _removeSystemHandler(handler) {
        (0, removeFromArray_1.default)(this.systemHandlers, handler);
    }
    async dispatch(data) {
        this.shouldStopPropagation = false;
        this.shouldPreventSystem = false;
        await this.runEventHandlerArr(this.highPriorityHandlers, data);
        if (!this.shouldStopPropagation) {
            await this.runEventHandlerArr(this.normalHandlers, data);
        }
        if (!this.shouldPreventSystem) {
            await this.runEventHandlerArr(this.systemHandlers, data);
        }
        return {
            stoppedPropagation: this.shouldStopPropagation,
            preventedSystem: this.shouldPreventSystem
        };
    }
    async runEventHandlerArr(arr, data) {
        const errors = [];
        const promises = [];
        logger_1.default.log_message("Event: " + data);
        for (const handler of arr) {
            promises.push((0, tryRun_1.default)(() => handler(data, this.eventControls))
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
