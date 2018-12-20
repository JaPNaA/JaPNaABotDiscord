import BotHooks from "./botHooks.js";

/**
 * @typedef {import("./botHooks.js")} BotHooks
 */

const createKey = require("./locationKeyCreator.js");

type JSONObject = {[x: string]: string | string[] | number | number[] | boolean | boolean[] | JSONObject | JSONObject[]};
type NestedObject = {
    [x: string]: {
        [x: string]: string
    }
};

class Config {
    /** Original config */
    _config: JSONObject;
    /** *raw* precommands that trigger the bot, from config */
    precommands: string[];
    /** The theme color used for general embeds */
    themeColor: number;
    /** The logging level used by Logger */
    loggingLevel: number;
    /** Tell the users that the bot doesn't know command? */
    doAlertCommandDoesNotExist: boolean;
    /** Overrides for bot commands */
    commandRequiredPermissionOverrides: NestedObject;
    /** How often to auto-write memory to disk? */
    autoWriteTimeInterval: number;
    /** Gitlab link to the bot */
    gitlabLink: string;
    /** Link to add bot to server */
    addLink: string;
    
    constructor(botHooks: BotHooks, config: JSONObject) {
        this._config = config as JSONObject;

        this.precommands = (config["bot.precommand"] || ["!"]) as string[];
        this.themeColor = parseInt((config["bot.themeColor"] as string), 16);
        this.loggingLevel = (config["bot.logging"] || 3) as number;
        this.doAlertCommandDoesNotExist = (config["bot.alertCommandDoesNotExist"] || false) as boolean;
        this.commandRequiredPermissionOverrides = (config["bot.commandRequiredPermissionOverrides"] || {}) as NestedObject;
        this.autoWriteTimeInterval = (config["memory.autoWriteInterval"] || 60 * 1000 /* Every minute */) as number;
        this.gitlabLink = (config["gitlabLink"] || "... oh wait hold on I don't have it...") as string;
        this.addLink = (config["addLink"] || "... oh wait I don't know how to...") as string;
    }

    get(key: string) {
        return this._config[key];
    }

    /** Gets config for plugin */
    getPlugin(pluginName: string) {
        return this.get(createKey.plugin(pluginName));
    }
}

module.exports = Config;