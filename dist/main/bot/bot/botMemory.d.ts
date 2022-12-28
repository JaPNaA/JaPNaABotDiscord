/// <reference types="node" />
import Bot from "./bot.js";
declare class Memory {
    private bot;
    memoryPath: string;
    memory: {
        [x: string]: any;
    };
    autoWriteIntervalId?: NodeJS.Timeout;
    memoryChanged: boolean;
    /**
     * Memory constructor
     * @param botHooks hooks can attach to
     * @param memoryPath path to memory
     * @param memory the memory object
     */
    constructor(bot: Bot, memoryPath: string, memory: object);
    /**
     * Stores something in memory
     * @param important write after remember?
     */
    write(namespace: string, key: string, value: string | number | object | undefined, important?: boolean): void;
    /**
     * Marks the memory changed, allowing a writeOut on the next writeOut_auto
     */
    markDirty(): void;
    get(namespace: string, key: string): any | null;
    /**
     * Writes memory to disk
     */
    writeOut(): Promise<void>;
    /**
     * Autowrite interval callback
     */
    writeOut_auto(): void;
    /**
     * Callback when memory is written
     * @param error, if any
     */
    _doneWriteMemory(error: any): void;
    /**
     * Starts automatically writing out
     */
    startAutoWrite(): void;
    /**
     * Stops automatically writing out
     */
    stopAutoWrite(): void;
}
export default Memory;
