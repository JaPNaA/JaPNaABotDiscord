import { JSONObject, JSONType } from "../../types/jsonObject.js";
import NestedObject from "../../types/nestedObjectStrMap";
import ObjectStrMap from "../../types/objectStrMap.js";
import createKey from "../utils/locationKeyCreator.js";
import Bot from "./bot.js";

class Config {
    /** Original config */
    private config: JSONObject;
    /** *raw* precommands that trigger the bot, from config */
    precommands: string[];
    /** The theme color used for general embeds */
    themeColor: number;
    /** The logging level used by Logger */
    loggingLevel: number;
    /** Tell the users that the bot doesn't know command? */
    doAlertCommandDoesNotExist: boolean;
    /** Overrides for bot commands */
    commandRequiredPermissionOverrides: NestedObject<NestedObject<ObjectStrMap>>;
    /** How often to auto-write memory to disk? */
    autoWriteTimeInterval: number;
    /** Gitlab link to the bot */
    gitlabLink: string;
    /** Link to add bot to server */
    addLink: string;
    /** Is the bot in debug mode? */
    debugMode: boolean;
    /** Debug mode precommand, only exists if debugMode is true */
    debugPrecommand: string;

    constructor(bot: Bot, config: object) {
        this.config = config as JSONObject;

        this.precommands = (this.config["bot.precommand"] || ["!"]) as string[];
        this.themeColor = parseInt((this.config["bot.themeColor"] as string), 16);
        this.loggingLevel = (this.config["bot.logging"] || 3) as number;
        this.doAlertCommandDoesNotExist = (this.config["bot.alertCommandDoesNotExist"] || false) as boolean;
        this.commandRequiredPermissionOverrides = (this.config["bot.commandRequiredPermissionOverrides"] || {}) as any;
        this.autoWriteTimeInterval = (this.config["memory.autoWriteInterval"] || 60 * 1000 /* Every minute */) as number;
        this.gitlabLink = (this.config.gitlabLink || "... oh wait hold on I don't have it...") as string;
        this.addLink = (this.config.addLink || "... oh wait I don't know how to...") as string;
        this.debugMode = this.config.__debug as boolean;
        this.debugPrecommand = this.config.__debugPrecommand as string;
    }

    get(key: string): JSONType | undefined {
        return this.config[key];
    }

    /** Gets config for plugin */
    getPlugin(pluginName: string): JSONType | undefined {
        return this.get(createKey.plugin(pluginName));
    }
}

export default Config;