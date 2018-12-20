/**
 * @typedef {import("./botHooks.js")} BotHooks
 */
declare const FS: any;
declare const Logger: any;
declare class Memory {
    /**
     * Memory constructor
     * @param {BotHooks} botHooks hooks can attach to
     * @param {String} memoryPath path to memory
     * @param {Object} memory the memory object
     */
    constructor(botHooks: any, memoryPath: any, memory: any);
    /**
     * Stores something in memory
     * @param {String} namespace namespace of thing to remember
     * @param {String} key key
     * @param {String|Number|Object} value value to remember
     * @param {Boolean} [important=false] write after remember?
     */
    write(namespace: any, key: any, value: any, important: any): void;
    /**
     * Recalls something from memory
     * @param {String} namespace namespace of thing
     * @param {String} key key
     */
    get(namespace: any, key: any): any;
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
     * @param {NodeJS.ErrnoException} error error, if any
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
