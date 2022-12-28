import FS from "fs";
import Logger from "../../utils/logger.js";
import Bot from "./bot.js";

class Memory {
    memoryPath: string;
    memory: { [x: string]: any };
    autoWriteIntervalId?: NodeJS.Timeout;
    memoryChanged: boolean;
    /**
     * Memory constructor
     * @param botHooks hooks can attach to
     * @param memoryPath path to memory
     * @param memory the memory object
     */
    constructor(private bot: Bot, memoryPath: string, memory: object) {
        this.memoryPath = memoryPath;
        this.memory = memory;
        this.memoryChanged = false;
    }

    /**
     * Stores something in memory
     * @param important write after remember?
     */
    write(namespace: string, key: string, value: string | number | object | undefined, important: boolean = false): void {
        if (!this.memory[namespace]) {
            this.memory[namespace] = {};
        }

        this.memory[namespace][key] = value;
        this.memoryChanged = true;

        if (important) {
            this.writeOut();
        }
    }

    /**
     * Marks the memory changed, allowing a writeOut on the next writeOut_auto
     */
    markDirty() {
        this.memoryChanged = true;
    }

    get(namespace: string, key: string): any | null {
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
    async writeOut() {
        this.bot.newAsyncRequest();
        const { preventedSystem } = await this.bot.events.beforeMemoryWrite.dispatch();
        if (preventedSystem) {
            Logger.log("Memory write out prevented.");
            return;
        }

        FS.writeFile(this.memoryPath, JSON.stringify(this.memory), this._doneWriteMemory.bind(this));

        this.memoryChanged = false;
    }

    /**
     * Autowrite interval callback
     */
    writeOut_auto(): void {
        if (!this.memoryChanged) { return; }
        this.writeOut();
    }

    /**
     * Callback when memory is written
     * @param error, if any
     */
    _doneWriteMemory(error: any): void {
        this.bot.doneAsyncRequest();
        if (error) {
            Logger.error("Failed to write to memory", error);
            return;
        }
        Logger.log("Written to memory");
    }

    /**
     * Starts automatically writing out
     */
    startAutoWrite(): void {
        this.autoWriteIntervalId = setInterval(this.writeOut_auto.bind(this), this.bot.config.autoWriteTimeInterval);
    }

    /**
     * Stops automatically writing out
     */
    stopAutoWrite(): void {
        if (this.autoWriteIntervalId) {
            clearInterval(this.autoWriteIntervalId);
        }
    }
}

export default Memory;