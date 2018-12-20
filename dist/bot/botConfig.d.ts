import BotHooks from "./botHooks.js";
declare type JSONObject = {
    [x: string]: string | string[] | number | number[] | boolean | boolean[] | JSONObject | JSONObject[];
};
declare type NestedObject = {
    [x: string]: {
        [x: string]: string;
    };
};
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
    constructor(botHooks: BotHooks, config: object);
    get(key: string): string | number | boolean | string[] | JSONObject | number[] | boolean[] | JSONObject[];
    /** Gets config for plugin */
    getPlugin(pluginName: string): string | number | boolean | string[] | JSONObject | number[] | boolean[] | JSONObject[];
}
export default Config;
