/**
 * @typedef {import("./botHooks.js")} BotHooks
 */
declare const createKey: any;
declare class Config {
    /**
     * Config data structure, provides defaults
     * @param {BotHooks} botHooks
     * @param {Object} config raw config.json object
     */
    constructor(botHooks: any, config: any);
    /**
     * @param {String} key
     */
    get(key: any): any;
    /**
     * Gets config for plugin
     * @param {String} pluginName name of plugin
     */
    getPlugin(pluginName: any): any;
}
