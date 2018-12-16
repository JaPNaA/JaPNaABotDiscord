/**
 * @typedef {import("../botHooks.js")} BotHooks
 */

const FS = require("fs");
const Logger = require("../../logger.js");
const MemoryLocationKeyCreator = require("./locationKeyCreator.js");

class Memory {
    /**
     * Memory constructor
     * @param {BotHooks} botHooks hooks can attach to
     * @param {String} memoryPath path to memory
     * @param {Object} memory the memory object
     */
    constructor(botHooks, memoryPath, memory) {
        /** 
         * Path to memory
         * @type {String}
         */
        this.memoryPath = memoryPath;

        /**
         * Bot memory
         * @type {Object}
         */
        this.memory = memory;


        /**
         * Timeout that writes memory to disk every once in a while
         * @type {NodeJS.Timeout}
         * @private
         */
        this.autoWriteIntervalId = null;

        /**
         * Has the memory changed since last write?
         * @type {Boolean}
         */
        this.memoryChanged = false;

        /**
         * @type {BotHooks}
         */
        this.botHook = botHooks;

        /**
         * @type {MemoryLocationKeyCreator}
         */
        this.keyCreator = new MemoryLocationKeyCreator(this);
    }

    /**
     * Stores something in memory
     * @param {String} namespace namespace of thing to remember
     * @param {String} key key
     * @param {String|Number|Object} value value to remember
     * @param {Boolean} [important=false] write after remember?
     */
    write(namespace, key, value, important) {
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
     * Recalls something from memory
     * @param {String} namespace namespace of thing
     * @param {String} key key
     */
    get(namespace, key) {
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
     * @param {NodeJS.ErrnoException} error error, if any
     */
    _doneWriteMemory(error) {
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
        clearInterval(this.autoWriteIntervalId);
    }
}

module.exports = Memory;