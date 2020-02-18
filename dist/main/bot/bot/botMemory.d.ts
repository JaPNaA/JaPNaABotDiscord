/// <reference types="node" />
import BotHooks from "./botHooks.js";
declare class Memory {
    memoryPath: string;
    memory: {
        [x: string]: any;
    };
    autoWriteIntervalId?: NodeJS.Timeout;
    memoryChanged: boolean;
    botHook: BotHooks;
    /**
     * Memory constructor
     * @param botHooks hooks can attach to
     * @param memoryPath path to memory
     * @param memory the memory object
     */
    constructor(botHooks: BotHooks, memoryPath: string, memory: object);
    /**
     * Stores something in memory
     * @param important write after remember?
     */
    write(namespace: string, key: string, value: string | number | object | undefined, important?: boolean): void;
    get(namespace: string, key: string): any | null;
    /**
     * Writes memory to disk
     */
    writeOut(): void;
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
