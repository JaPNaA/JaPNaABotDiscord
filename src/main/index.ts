import FS from "fs";
import PATH from "path";
import DISCORD from "discord.js";
import STRIP_JSON_COMMENTS from "strip-json-comments";
import Logger from "./logger.js";
import Bot from "./bot/bot.js";
import BotHooks from "./bot/botHooks.js";

let client: DISCORD.Client;

let bot: Bot;
let botHooks: BotHooks;

// let shuttingDown = false;

let defaultConfig = JSON.parse(
    STRIP_JSON_COMMENTS(FS.readFileSync(__dirname + "/../../data/config.jsonc").toString())
);
let runtimeConfig: { [x: string]: any } = {};
let memory: { [x: string]: any };

// configureables
// ----------------------------------------------------------------------------------------
let memoryPath = "../../data/memory.json";

let token: string;
let config: { [x: string]: any };
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
 * @param base base
 * @param override override
 * @returns concated object
 */
function _concatObject(base: { [s: string]: any; }, override: { [s: string]: any; }): { [s: string]: any; } {
    let c = { ...base };

    let overrideKeys = Object.keys(override);

    for (let key of overrideKeys) {
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
 * @param path path to plugin
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
 * @param name name of built-in plugin
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
 * @param path path to plugin
 * @returns any errors that may have occured while loading plugin
 */
function loadPlugin(path: string): Error | null {
    let npath: string;

    if (require.main) {
        npath = PATH.join(PATH.dirname(require.main.filename), path);
    } else {
        npath = PATH.join(PATH.dirname(__filename), path);
    }

    // delete old plugin cache
    delete require.cache[require.resolve(npath)];

    try {
        let plugin = new (require(npath).default)(bot.hooks);
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
 * @param name name of builtin plugin
 * @returns any errors that may have occured while loading plugin
 */
function loadBuiltinPlugin(name: string): Error | null {
    let npath = "../plugins/" + name + ".js";

    // delete old plugin cache
    delete require.cache[require.resolve(npath)];

    try {
        let plugin = new (require(npath).default)(bot.hooks);
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
 * @param apiToken The Discord API token
 * @param botConfig The bot's config, overriding default config, 
 * or path to json/jsonc config.
 * 
 * Choosing a path will allow the bot to reload the config when you call the `!reload` command
 * 
 * @param pathToMemoryFile the path to the memory file for the bot
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
 * @param [timeout] time until the stop is forced. Null for no timeout
 * @returns resolves when the bot finishes stopping
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
 * @returns bot
 */
function getBot(): Bot {
    return bot;
}

/**
 * Gets the default config
 * @returns default bot config
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