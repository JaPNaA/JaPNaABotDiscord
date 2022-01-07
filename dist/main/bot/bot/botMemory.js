"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const logger_js_1 = __importDefault(require("../../utils/logger.js"));
class Memory {
    /**
     * Memory constructor
     * @param botHooks hooks can attach to
     * @param memoryPath path to memory
     * @param memory the memory object
     */
    constructor(bot, memoryPath, memory) {
        this.bot = bot;
        this.memoryPath = memoryPath;
        this.memory = memory;
        this.memoryChanged = false;
    }
    /**
     * Stores something in memory
     * @param important write after remember?
     */
    write(namespace, key, value, important = false) {
        if (!this.memory[namespace]) {
            this.memory[namespace] = {};
        }
        this.memory[namespace][key] = value;
        this.memoryChanged = true;
        if (important) {
            this.writeOut();
        }
    }
    get(namespace, key) {
        if (!this.memory[namespace]) {
            return null;
        }
        if (this.memory[namespace].hasOwnProperty(key)) {
            return this.memory[namespace][key];
        }
        else {
            return null;
        }
    }
    /**
     * Writes memory to disk
     */
    writeOut() {
        this.bot.newAsyncRequest();
        this.bot.events.dispatch("beforememorywrite", null);
        fs_1.default.writeFile(this.memoryPath, JSON.stringify(this.memory), this._doneWriteMemory.bind(this));
        this.memoryChanged = false;
    }
    /**
     * Autowrite interval callback
     */
    writeOut_auto() {
        if (!this.memoryChanged) {
            return;
        }
        this.writeOut();
    }
    /**
     * Callback when memory is written
     * @param error, if any
     */
    _doneWriteMemory(error) {
        this.bot.doneAsyncRequest();
        if (error) {
            logger_js_1.default.error("Failed to write to memory", error);
            return;
        }
        logger_js_1.default.log("Written to memory");
    }
    /**
     * Starts automatically writing out
     */
    startAutoWrite() {
        this.autoWriteIntervalId = setInterval(this.writeOut_auto.bind(this), this.bot.config.autoWriteTimeInterval);
    }
    /**
     * Stops automatically writing out
     */
    stopAutoWrite() {
        if (this.autoWriteIntervalId) {
            clearInterval(this.autoWriteIntervalId);
        }
    }
}
exports.default = Memory;
