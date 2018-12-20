"use strict";
/**
 * @typedef {import("./botHooks.js")} BotHooks
 */
const createKey = require("./locationKeyCreator.js");
class Config {
    /**
     * Config data structure, provides defaults
     * @param {BotHooks} botHooks
     * @param {Object} config raw config.json object
     */
    constructor(botHooks, config) {
        /**
         * Original config
         * @type {Object}
         */
        this._config = config;
        /**
         * *raw* precommands that trigger the bot, from config
         * @type {String[]}
         */
        this.precommands = config["bot.precommand"] || ["!"];
        /**
         * The theme color used for general embeds
         * @type {Number}
         */
        this.themeColor = parseInt(config["bot.themeColor"], 16);
        /**
         * Bot logging level
         * @type {Number}
         */
        this.loggingLevel = config["bot.logging"] || 3;
        /**
         * Tell the user that th bot doesn't know command?
         * @type {Boolean}
         */
        this.doAlertCommandDoesNotExist = config["bot.alertCommandDoesNotExist"] || false;
        /**
         * Overrides for bot commands
         * @type {Object.<string, Object.<string, string>>}
         */
        this.commandRequiredPermissionOverrides = config["bot.commandRequiredPermissionOverrides"] || {};
        /**
         * How often to auto-write to disk?
         * @type {Number}
         */
        this.autoWriteTimeInterval = config["memory.autoWriteInterval"] || 60 * 1000; // every minute
        /**
         * Gitlab link to bot
         * @type {String}
         */
        this.gitlabLink = config["gitlabLink"] || "... oh wait hold on I don't have it...";
        /**
         * Link to add bot to server
         * @type {String}
         */
        this.addLink = config["addLink"] || "... oh wait I don't know how to...";
    }
    /**
     * @param {String} key
     */
    get(key) {
        return this._config[key];
    }
    /**
     * Gets config for plugin
     * @param {String} pluginName name of plugin
     */
    getPlugin(pluginName) {
        return this.get(createKey.plugin(pluginName));
    }
}
module.exports = Config;
