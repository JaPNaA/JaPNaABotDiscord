import FS from "fs";
import PATH from "path";
import DISCORD, { Intents } from "discord.js";
import STRIP_JSON_COMMENTS from "strip-json-comments";
import Logger from "./utils/logger.js";
import Bot from "./bot/bot/bot.js";
import BotHooks from "./bot/bot/botHooks.js";
import BotPlugin from "./bot/plugin/plugin.js";

let client: DISCORD.Client;

let bot: Bot;
let botHooks: BotHooks;

// let shuttingDown = false;

let defaultConfig: object = JSON.parse(
    STRIP_JSON_COMMENTS(FS.readFileSync(__dirname + "/../../data/config.jsonc").toString())
);
let runtimeConfig: { [x: string]: any } = {};
let memory: { [x: string]: any };

// configureables
// ----------------------------------------------------------------------------------------
let memoryPath: string = "../../data/memory.json";

let token: string;
let config: { [x: string]: any };
let configPath: string | null = null;

/**
 * Initializes the bot
 */
function _init(): void {
    _getConfigFromPath();
    bot = new Bot(config, memory, memoryPath, client, _init);
    botHooks = bot.hooks;

    if (config.autoloadPlugins) {
        for (let pluginName of config.builtinPlugins) {
            loadBuiltinPlugin(pluginName);
        }
        for (let pluginPath of config.externalPlugins) {
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
    let c: { [x: string]: any } = { ...base };

    let overrideKeys: string[] = Object.keys(override);

    for (let key of overrideKeys) {
        let baseVal: any = base[key];
        let overrideVal: any = override[key];
        let cval: any = null;

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
function _getConfigFromPath(): void {
    if (!configPath) { return; }

    let fileConfig: object = JSON.parse(STRIP_JSON_COMMENTS(FS.readFileSync(configPath).toString()));
    config = {
        ...defaultConfig,
        ..._concatObject(fileConfig, runtimeConfig)
    };
}

/**
 * Registers a plugin to auto-load
 * @param path path to plugin
 */
function registerAutoloadPlugin(path: string): void {
    if (runtimeConfig.externalPlugins) {
        runtimeConfig.externalPlugins.push(path);
    } else {
        runtimeConfig.externalPlugins = [path];
    }

    loadPlugin(path);
}

/**
 * Registers a built-in plugin to auto-load
 * @param name name of built-in plugin
 */
function registerAutoloadBuiltinPlugin(name: string): void {
    if (runtimeConfig.builtinPlugins) {
        runtimeConfig.builtinPlugins.push(name);
    } else {
        runtimeConfig.builtinPlugins = [name];
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
        let plugin: BotPlugin = new (require(npath).default)(bot.hooks);
        bot.pluginManager.register(plugin);

        Logger.log("Successfully loaded external plugin", path);
        return null;
    } catch (e) {
        Logger.error("Failed to load external plugin", path, "\n", e);
        return e as Error;
    }
}

/**
 * loads/reloads a builtin plugin
 * @param name name of builtin plugin
 * @returns any errors that may have occured while loading plugin
 */
function loadBuiltinPlugin(name: string): Error | null {
    let npath: string = "../plugins/" + name + ".js";

    // delete old plugin cache
    delete require.cache[require.resolve(npath)];

    try {
        let plugin: BotPlugin = new (require(npath).default)(bot.hooks);
        bot.pluginManager.register(plugin);

        Logger.log("Successfully loaded built-in plugin", name);
        return null;
    } catch (e) {
        Logger.error("Failed to load built-in plugin", name, "\n", e);
        return e as Error;
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
function start(apiToken: string, botConfig: string | object, pathToMemoryFile: string): void {
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

    client = new DISCORD.Client({
        intents: [
            Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.DIRECT_MESSAGES
        ],
        partials: ["CHANNEL", "MESSAGE"]
    });
    client.login(token);

    client.on("ready", () =>
        botHooks.rawEventAdapter.onReady()
    );
    client.on("messageCreate", event =>
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
function stop(timeout?: number): Promise<any> {
    // shuttingDown = true;
    bot.stop();
    client.destroy();
    Logger.log("\nGracefully stopping...");

    let promise: Promise<any> = new Promise(function (resolve: Function): void {
        if (bot.hasActiveAsyncRequests()) {
            Logger.log("Waiting for asnyc requests to finish...");

            bot.events.on("doneasync", function (): void {
                if (!bot.hasActiveAsyncRequests()) {
                    Logger.log("Async requests done");
                    resolve(true);
                }
            });
        } else {
            resolve(true);
        }

        if (timeout !== undefined) {
            setTimeout(function (): void {
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
function getBot(): BotHooks {
    return bot.hooks;
}

/**
 * Gets the default config
 * @returns default bot config
 */
function getDefaultConfig(): { [x: string]: any } {
    return defaultConfig;
}

const classes = {
    Bot: require("./bot/bot/bot.js").default,
    BotCommand: require("./bot/command/command.js").default,
    BotCommandOptions: require("./bot/command/commandOptions.js").default,
    BotCommandHelp: require("./bot/command/commandHelp.js").default,
    events: {
        DiscordCommandEvent: require("./bot/events/discordCommandEvent").default,
        DiscordMessageEvent: require("./bot/events/discordMessageEvent").default,
    },
    Logger: require("./utils/logger.js").default,
    Permissions: require("./types/permissions.js").default,
    BotPlugin: require("./bot/plugin/plugin.js").default,
    utils: require("./utils/allUtils.js")
}

export {
    loadPlugin, loadBuiltinPlugin,
    registerAutoloadPlugin, registerAutoloadBuiltinPlugin,
    start, stop,
    getBot, getDefaultConfig,

    classes
};

if (process.argv.slice(2).includes("--msg-debug-mode")) {
    require("./msgDebugMode");
}

if (require.main === module) { // if not being 'require'-d into something else
    require("./run-standalone");
}