"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @typedef {import("./botHooks.js")} BotHooks
 */
const createKey = require("./locationKeyCreator.js");
class Config {
    constructor(botHooks, config) {
        this.config = config;
        this.precommands = (this.config["bot.precommand"] || ["!"]);
        this.themeColor = parseInt(this.config["bot.themeColor"], 16);
        this.loggingLevel = (this.config["bot.logging"] || 3);
        this.doAlertCommandDoesNotExist = (this.config["bot.alertCommandDoesNotExist"] || false);
        this.commandRequiredPermissionOverrides = (this.config["bot.commandRequiredPermissionOverrides"] || {});
        this.autoWriteTimeInterval = (this.config["memory.autoWriteInterval"] || 60 * 1000 /* Every minute */);
        this.gitlabLink = (this.config["gitlabLink"] || "... oh wait hold on I don't have it...");
        this.addLink = (this.config["addLink"] || "... oh wait I don't know how to...");
    }
    get(key) {
        return this.config[key];
    }
    /** Gets config for plugin */
    getPlugin(pluginName) {
        return this.get(createKey.plugin(pluginName));
    }
}
exports.default = Config;
