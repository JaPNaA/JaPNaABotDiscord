/**
 * @typedef {import("./bot/botHooks.js")} BotHooks
 */

import FS from "fs";
import PATH from "path";
import DISCORD from "discord.js";
import STRIP_JSON_COMMENTS from "strip-json-comments";
import Logger from "./logger.js";
import Bot from "./bot/bot.js";

/** @type {DISCORD.Client} */
let client: DISCORD.Client = null;

/** @type {Bot} */
let bot: Bot = null;
/** @type {BotHooks} */
let botHooks: BotHooks = null;

// let shuttingDown = false;

let defaultConfig = JSON.parse(
    STRIP_JSON_COMMENTS(FS.readFileSync(__dirname + "/../data/config.jsonc").toString())
);
let runtimeConfig = {};
let memory = null;

// configureables
// ----------------------------------------------------------------------------------------
let memoryPath = "../data/memory.json";

/** @type {String} */
let token: string = null;
/** @type {Object} */
let config: object = null;
/** @type {String|null} */
let configPath: string | null = null;

/**
 * Initializes the bot
 */
function _init() {
    _getConfigFromPath();
    bot = new Bot(config, memory, memoryPath, client, _init);
    botHooks = bot.hooks;

    if (config["autoloadPlugins"]) {
        for (let pluginName of config["builtinPlugins"]) {
            loadBuiltinPlugin(pluginName);
        }
        for (let pluginPath of config["externalPlugins"]) {
            loadPlugin(pluginPath);
        }
    }
}

/**
 * Concats objects, and arrays, if it comes across any
 * @param {Object.<string, any>} base base
 * @param {Object.<string, any>} override override
 * @returns {Object.<string, any>} concated object
 */
function _concatObject(base: { [s: string]: any; }, override: { [s: string]: any; }): { [s: string]: any; } {
    let c = { ...base };

    let overrideKey = Object.keys(override);

    for (let key of overrideKey) {
        let baseVal = base[key];
        let overrideVal = override[key];
        let cval = null;

        if (Array.isArray(baseVal)) {
            cval = baseVal.concat(overrideVal);
        } else {
            cval = overrideVal || baseVal;
        }

        c[key] = cval;
    }

    return c;
}

/**
 * Sets the config to the contents of the config file
 */
function _getConfigFromPath() {
    if (!configPath) return;

    let fileConfig = JSON.parse(STRIP_JSON_COMMENTS(FS.readFileSync(configPath).toString()));
    config = {
        ...defaultConfig,
        ..._concatObject(fileConfig, runtimeConfig)
    };
}

/**
 * Registers a plugin to auto-load
 * @param {String} path path to plugin
 */
function registerAutoloadPlugin(path: string) {
    if (runtimeConfig["externalPlugins"]) {
        runtimeConfig["externalPlugins"].push(path);
    } else {
        runtimeConfig["externalPlugins"] = [path];
    }

    loadPlugin(path);
}

/**
 * Registers a built-in plugin to auto-load
 * @param {String} name name of built-in plugin
 */
function registerAutoloadBuiltinPlugin(name: string) {
    if (runtimeConfig["builtinPlugins"]) {
        runtimeConfig["builtinPlugins"].push(name);
    } else {
        runtimeConfig["builtinPlugins"] = [name];
    }

    loadBuiltinPlugin(name);
}

/**
 * loads/reloads plugin
 * @param {String} path path to plugin
 * @returns {Error} any errors that may have occured while loading plugin
 */
function loadPlugin(path: string): Error {
    let npath = PATH.join(PATH.dirname(require.main.filename), path);

    // delete old plugin cache
    delete require.cache[require.resolve(npath)];

    try {
        let plugin = new (require(npath))(bot);
        bot.commandManager.register.plugin(plugin);

        Logger.log("Successfully loaded external plugin", path);
        return null;
    } catch (e) {
        Logger.error("Failed to load external plugin", path, "\n", e);
        return e;
    }
}

/**
 * loads/reloads a builtin plugin
 * @param {String} name name of builtin plugin
 * @returns {Error} any errors that may have occured while loading plugin
 */
function loadBuiltinPlugin(name: string): Error {
    let npath = "../plugins/" + name + ".js";

    // delete old plugin cache
    delete require.cache[require.resolve(npath)];

    try {
        let plugin = new (require(npath))(bot);
        bot.commandManager.register.plugin(plugin);

        Logger.log("Successfully loaded built-in plugin", name);
        return null;
    } catch (e) {
        Logger.error("Failed to load built-in plugin", name, "\n", e);
        return e;
    }
}

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
function start(apiToken: string, botConfig: string | object, pathToMemoryFile: string) {
    token = apiToken;

    if (typeof botConfig === "string") {
        configPath = botConfig;
    } else {
        config = {
            ...defaultConfig,
            ...botConfig
        };
    }

    memoryPath = pathToMemoryFile;

    client = new DISCORD.Client();
    client.login(token);

    client.on("ready", () => 
        botHooks.rawEventAdapter.onReady()
    );
    client.on("message", event =>
        botHooks.rawEventAdapter.onMessage(event)
    );

    // not required by discord.js
    // client.on("disconnect", function () {
    //     if (!shuttingDown) {
    //         client.login(apiToken);
    //     }
    // });

    try { // in case the memory file doesn't exist
        memory = JSON.parse(FS.readFileSync(memoryPath).toString());
    } catch (e) {
        FS.writeFileSync(memoryPath, "{}");
        memory = {};
    }

    // shuttingDown = false;

    _init();
}

/**
 * Stop the bot
 * @param {Number} [timeout] time until the stop is forced. Null for no timeout
 * @returns {Promise} resolves when the bot finishes stopping
 */
function stop(timeout: number): Promise<any> {
    // shuttingDown = true;
    bot.stop();
    client.destroy();
    Logger.log("\nGracefully stopping...");

    let promise = new Promise(function (resolve) {
        if (bot.hasActiveAsyncRequests()) {
            Logger.log("Waiting for asnyc requests to finish...");

            bot.events.on("doneasync", function () {
                if (!bot.hasActiveAsyncRequests()) {
                    Logger.log("Async requests done");
                    resolve(true);
                }
            });
        } else {
            resolve(true);
        }

        if (timeout !== undefined) {
            setTimeout(function () {
                resolve(false);
                Logger.warn("Stop handler timed out");
            }, timeout);
        }
    });

    return promise;
}

/**
 * Gets the local variable, bot
 * @returns {Bot} bot
 */
function getBot(): Bot {
    return bot;
}

/**
 * Gets the default config
 * @returns {Object} default bot config
 */
function getDefaultConfig(): object {
    return defaultConfig;
}

export default {
    loadPlugin, loadBuiltinPlugin,
    registerAutoloadPlugin, registerAutoloadBuiltinPlugin,
    start, stop,
    getBot, getDefaultConfig,

    Bot: require("./bot/bot.js"),
    BotCommand: require("./botcommand.js"),
    BotCommandOptions: require("./botcommandOptions.js"),
    BotCommandHelp: require("./botcommandHelp.js"),
    events: require("./events.js"),
    Logger: require("./logger.js"),
    Permissions: require("./permissions.js"),
    BotPlugin: require("./plugin.js"),
    utils: require("./utils.js")
};

// @ts-ignore
if (require.main === module) { // if not being 'require'-d into something else
    require("./run-standalone");
}