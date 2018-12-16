/**
 * @typedef {import("./bot.js")} Bot
 * @typedef {import("./memory.js")} Memory
 * @typedef {import("./config.js")} Config
 */

class BotHooks {
    /**
     * @param {Bot} bot
     */
    constructor(bot) {
        /**
         * Bot memory
         * @type {Memory}
         */
        this.memory = null;

        /**
         * Bot config
         * @type {Config}
         */
        this.config = null;

        /**
         * The bot to reference
         * @type {Bot}
         */
        this.bot = bot;
    }

    /**
     * Attaches memory to hook
     * @param {Memory} memory
     */
    attachMemory(memory) {
        this.memory = memory;
    }

    /**
     * Attaches config to hook
     * @param {Config} config
     */
    attachConfig(config) {
        this.config = config;
    }

    /**
     * Add new asnyc request to wait for
     */
    newAsyncRequest() {
        this.bot.newAsyncRequest();
    }

    /**
     * Remove asnyc request to wait for
     */
    doneAsyncRequest() {
        this.bot.doneAsyncRequest();
    }

    /**
     * Call all event handlers for event
     * @param {String} name of event
     * @param {*} event Event data sent with dispatch
     */
    dispatchEvent(name, event) {
        this.bot.dispatchEvent(name, event);
    }
}

module.exports = BotHooks;