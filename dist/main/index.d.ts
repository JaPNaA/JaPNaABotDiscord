import Bot from "./bot/bot/bot.js";
/**
 * Registers a plugin to auto-load
 * @param path path to plugin
 */
declare function registerAutoloadPlugin(path: string): void;
/**
 * Registers a built-in plugin to auto-load
 * @param name name of built-in plugin
 */
declare function registerAutoloadBuiltinPlugin(name: string): void;
/**
 * loads/reloads plugin
 * @param path path to plugin
 * @returns any errors that may have occured while loading plugin
 */
declare function loadPlugin(path: string): Error | null;
/**
 * loads/reloads a builtin plugin
 * @param name name of builtin plugin
 * @returns any errors that may have occured while loading plugin
 */
declare function loadBuiltinPlugin(name: string): Error | null;
/**
 * Starts the bot
 * @param apiToken The Discord API token
 * @param botConfig The bot's config, overriding default config,
 * or path to json/jsonc config.
 *
 * Choosing a path will allow the bot to reload the config when you call the `!reload` command
 *
 * @param pathToMemoryFile the path to the memory file for the bot
 */
declare function start(apiToken: string, botConfig: string | object, pathToMemoryFile: string): void;
/**
 * Stop the bot
 * @param [timeout] time until the stop is forced. Null for no timeout
 * @returns resolves when the bot finishes stopping
 */
declare function stop(timeout?: number): Promise<any>;
/**
 * Gets the local variable, bot
 * @returns bot
 */
declare function getBot(): Bot;
/**
 * Gets the default config
 * @returns default bot config
 */
declare function getDefaultConfig(): {
    [x: string]: any;
};
declare const classes: {
    Bot: any;
    BotCommand: any;
    BotCommandOptions: any;
    BotCommandHelp: any;
    events: {
        DiscordCommandEvent: any;
        DiscordMessageEvent: any;
    };
    Logger: any;
    Permissions: any;
    BotPlugin: any;
    utils: any;
};
export { loadPlugin, loadBuiltinPlugin, registerAutoloadPlugin, registerAutoloadBuiltinPlugin, start, stop, getBot, getDefaultConfig, classes };
