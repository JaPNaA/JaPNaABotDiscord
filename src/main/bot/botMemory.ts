import FS from "fs";
import Logger from "../logger.js";
import BotHooks from "./botHooks.js";

class Memory {
    memoryPath: string;
    memory: {[x: string]: any};
    autoWriteIntervalId?: NodeJS.Timeout;
    memoryChanged: boolean;
    botHook: BotHooks;
    /**
     * Memory constructor
     * @param botHooks hooks can attach to
     * @param memoryPath path to memory
     * @param memory the memory object
     */
    constructor(botHooks: BotHooks, memoryPath: string, memory: object) {
        this.memoryPath = memoryPath;
        this.memory = memory;
        this.memoryChanged = false;
        this.botHook = botHooks;
    }

    /**
     * Stores something in memory
     * @param important write after remember?
     */
    write(namespace: string, key: string, value: string | number | object | undefined, important: boolean = false) {
        if (!this.memory[namespace]) {
            this.memory[namespace] = {};
        }

        this.memory[namespace][key] = value;
        this.memoryChanged = true;

        if (important) {
            this.writeOut();
        }
    }

    get(namespace: string, key: string) {
        if (!this.memory[namespace]) {
            return null;
        }
        if (this.memory[namespace].hasOwnProperty(key)) {
            return this.memory[namespace][key];
        } else {
            return null;
        }
    }

    /**
     * Writes memory to disk
     */
    writeOut() {
        this.botHook.newAsyncRequest();
        this.botHook.dispatchEvent("beforememorywrite", null);

        FS.writeFile(this.memoryPath, JSON.stringify(this.memory), this._doneWriteMemory.bind(this));

        this.memoryChanged = false;
    }

    /**
     * Autowrite interval callback
     */
    writeOut_auto() {
        if (!this.memoryChanged) return;
        this.writeOut();
    }

    /**
     * Callback when memory is written
     * @param error, if any
     */
    _doneWriteMemory(error: NodeJS.ErrnoException) {
        this.botHook.doneAsyncRequest();
        if (error) {
            Logger.error("Failed to write to memory", error);
            return;
        }
        Logger.log("Written to memory");
    }

    /**
     * Starts automatically writing out
     */
    startAutoWrite() {
        this.autoWriteIntervalId = setInterval(this.writeOut_auto.bind(this), this.botHook.config.autoWriteTimeInterval);
    }

    /**
     * Stops automatically writing out
     */
    stopAutoWrite() {
        if (this.autoWriteIntervalId)
            clearInterval(this.autoWriteIntervalId);
    }
}

export default Memory;