import { JSONType } from "../../types/jsonObject.js";
import NestedObject from "../../types/nestedObjectStrMap";
import Bot from "./bot.js";
declare class Config {
    /** Original config */
    private config;
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
    /** Is the bot in debug mode? */
    debugMode: boolean;
    /** Debug mode precommand, only exists if debugMode is true */
    debugPrecommand: string;
    constructor(bot: Bot, config: object);
    get(key: string): JSONType | undefined;
    /** Gets config for plugin */
    getPlugin(pluginName: string): JSONType | undefined;
}
export default Config;
