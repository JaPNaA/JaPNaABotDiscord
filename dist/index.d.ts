import Bot from "./bot/bot.js";
/**
 * Registers a plugin to auto-load
 * @param {String} path path to plugin
 */
declare function registerAutoloadPlugin(path: string): void;
/**
 * Registers a built-in plugin to auto-load
 * @param {String} name name of built-in plugin
 */
declare function registerAutoloadBuiltinPlugin(name: string): void;
/**
 * loads/reloads plugin
 * @param {String} path path to plugin
 * @returns {Error} any errors that may have occured while loading plugin
 */
declare function loadPlugin(path: string): Error | null;
/**
 * loads/reloads a builtin plugin
 * @param {String} name name of builtin plugin
 * @returns {Error} any errors that may have occured while loading plugin
 */
declare function loadBuiltinPlugin(name: string): Error | null;
/**
 * Starts the bot
 * @param {String} apiToken The Discord API token
 * @param {String | Object} botConfig The bot's config, overriding default config,
 * or path to json/jsonc config.
 *
 * Choosing a path will allow the bot to reload the config when you call the `!reload` command
 *
 * @param {String} pathToMemoryFile the path to the memory file for the bot
 */
declare function start(apiToken: string, botConfig: string | object, pathToMemoryFile: string): void;
/**
 * Stop the bot
 * @param {Number} [timeout] time until the stop is forced. Null for no timeout
 * @returns {Promise} resolves when the bot finishes stopping
 */
declare function stop(timeout: number): Promise<any>;
/**
 * Gets the local variable, bot
 * @returns {Bot} bot
 */
declare function getBot(): Bot;
/**
 * Gets the default config
 * @returns {Object} default bot config
 */
declare function getDefaultConfig(): object;
declare const _default: {
    loadPlugin: typeof loadPlugin;
    loadBuiltinPlugin: typeof loadBuiltinPlugin;
    registerAutoloadPlugin: typeof registerAutoloadPlugin;
    registerAutoloadBuiltinPlugin: typeof registerAutoloadBuiltinPlugin;
    start: typeof start;
    stop: typeof stop;
    getBot: typeof getBot;
    getDefaultConfig: typeof getDefaultConfig;
    Bot: any;
    BotCommand: any;
    BotCommandOptions: any;
    BotCommandHelp: any;
    events: any;
    Logger: any;
    Permissions: any;
    BotPlugin: any;
    utils: any;
};
export default _default;
