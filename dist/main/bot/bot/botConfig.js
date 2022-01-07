"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const locationKeyCreator_js_1 = __importDefault(require("../utils/locationKeyCreator.js"));
class Config {
    /** Original config */
    config;
    /** *raw* precommands that trigger the bot, from config */
    precommands;
    /** The theme color used for general embeds */
    themeColor;
    /** The logging level used by Logger */
    loggingLevel;
    /** Tell the users that the bot doesn't know command? */
    doAlertCommandDoesNotExist;
    /** Overrides for bot commands */
    commandRequiredPermissionOverrides;
    /** How often to auto-write memory to disk? */
    autoWriteTimeInterval;
    /** Gitlab link to the bot */
    gitlabLink;
    /** Link to add bot to server */
    addLink;
    /** Is the bot in debug mode? */
    debugMode;
    /** Debug mode precommand, only exists if debugMode is true */
    debugPrecommand;
    constructor(bot, config) {
        this.config = config;
        this.precommands = (this.config["bot.precommand"] || ["!"]);
        this.themeColor = parseInt(this.config["bot.themeColor"], 16);
        this.loggingLevel = (this.config["bot.logging"] || 3);
        this.doAlertCommandDoesNotExist = (this.config["bot.alertCommandDoesNotExist"] || false);
        this.commandRequiredPermissionOverrides = (this.config["bot.commandRequiredPermissionOverrides"] || {});
        this.autoWriteTimeInterval = (this.config["memory.autoWriteInterval"] || 60 * 1000 /* Every minute */);
        this.gitlabLink = (this.config.gitlabLink || "... oh wait hold on I don't have it...");
        this.addLink = (this.config.addLink || "... oh wait I don't know how to...");
        this.debugMode = this.config.__debug;
        this.debugPrecommand = this.config.__debugPrecommand;
    }
    get(key) {
        return this.config[key];
    }
    /** Gets config for plugin */
    getPlugin(pluginName) {
        return this.get(locationKeyCreator_js_1.default.plugin(pluginName));
    }
}
exports.default = Config;
