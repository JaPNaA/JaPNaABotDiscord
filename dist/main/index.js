"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const discord_js_1 = __importDefault(require("discord.js"));
const strip_json_comments_1 = __importDefault(require("strip-json-comments"));
const logger_js_1 = __importDefault(require("./utils/logger.js"));
const bot_js_1 = __importDefault(require("./bot/bot/bot.js"));
let client;
let bot;
let botHooks;
// let shuttingDown = false;
let defaultConfig = JSON.parse(strip_json_comments_1.default(fs_1.default.readFileSync(__dirname + "/../../data/config.jsonc").toString()));
let runtimeConfig = {};
let memory;
// configureables
// ----------------------------------------------------------------------------------------
let memoryPath = "../../data/memory.json";
let token;
let config;
let configPath = null;
/**
 * Initializes the bot
 */
function _init() {
    _getConfigFromPath();
    bot = new bot_js_1.default(config, memory, memoryPath, client, _init);
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
function _concatObject(base, override) {
    let c = Object.assign({}, base);
    let overrideKeys = Object.keys(override);
    for (let key of overrideKeys) {
        let baseVal = base[key];
        let overrideVal = override[key];
        let cval = null;
        if (Array.isArray(baseVal)) {
            cval = baseVal.concat(overrideVal);
        }
        else {
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
    if (!configPath) {
        return;
    }
    let fileConfig = JSON.parse(strip_json_comments_1.default(fs_1.default.readFileSync(configPath).toString()));
    config = Object.assign({}, defaultConfig, _concatObject(fileConfig, runtimeConfig));
}
/**
 * Registers a plugin to auto-load
 * @param path path to plugin
 */
function registerAutoloadPlugin(path) {
    if (runtimeConfig.externalPlugins) {
        runtimeConfig.externalPlugins.push(path);
    }
    else {
        runtimeConfig.externalPlugins = [path];
    }
    loadPlugin(path);
}
exports.registerAutoloadPlugin = registerAutoloadPlugin;
/**
 * Registers a built-in plugin to auto-load
 * @param name name of built-in plugin
 */
function registerAutoloadBuiltinPlugin(name) {
    if (runtimeConfig.builtinPlugins) {
        runtimeConfig.builtinPlugins.push(name);
    }
    else {
        runtimeConfig.builtinPlugins = [name];
    }
    loadBuiltinPlugin(name);
}
exports.registerAutoloadBuiltinPlugin = registerAutoloadBuiltinPlugin;
/**
 * loads/reloads plugin
 * @param path path to plugin
 * @returns any errors that may have occured while loading plugin
 */
function loadPlugin(path) {
    let npath;
    if (require.main) {
        npath = path_1.default.join(path_1.default.dirname(require.main.filename), path);
    }
    else {
        npath = path_1.default.join(path_1.default.dirname(__filename), path);
    }
    // delete old plugin cache
    delete require.cache[require.resolve(npath)];
    try {
        let plugin = new (require(npath).default)(bot.hooks);
        bot.pluginManager.register(plugin);
        logger_js_1.default.log("Successfully loaded external plugin", path);
        return null;
    }
    catch (e) {
        logger_js_1.default.error("Failed to load external plugin", path, "\n", e);
        return e;
    }
}
exports.loadPlugin = loadPlugin;
/**
 * loads/reloads a builtin plugin
 * @param name name of builtin plugin
 * @returns any errors that may have occured while loading plugin
 */
function loadBuiltinPlugin(name) {
    let npath = "../plugins/" + name + ".js";
    // delete old plugin cache
    delete require.cache[require.resolve(npath)];
    try {
        let plugin = new (require(npath).default)(bot.hooks);
        bot.pluginManager.register(plugin);
        logger_js_1.default.log("Successfully loaded built-in plugin", name);
        return null;
    }
    catch (e) {
        logger_js_1.default.error("Failed to load built-in plugin", name, "\n", e);
        return e;
    }
}
exports.loadBuiltinPlugin = loadBuiltinPlugin;
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
function start(apiToken, botConfig, pathToMemoryFile) {
    token = apiToken;
    if (typeof botConfig === "string") {
        configPath = botConfig;
    }
    else {
        config = Object.assign({}, defaultConfig, botConfig);
    }
    memoryPath = pathToMemoryFile;
    client = new discord_js_1.default.Client();
    client.login(token);
    client.on("ready", () => botHooks.rawEventAdapter.onReady());
    client.on("message", event => botHooks.rawEventAdapter.onMessage(event));
    // not required by discord.js
    // client.on("disconnect", function () {
    //     if (!shuttingDown) {
    //         client.login(apiToken);
    //     }
    // });
    try { // in case the memory file doesn't exist
        memory = JSON.parse(fs_1.default.readFileSync(memoryPath).toString());
    }
    catch (e) {
        fs_1.default.writeFileSync(memoryPath, "{}");
        memory = {};
    }
    // shuttingDown = false;
    _init();
}
exports.start = start;
/**
 * Stop the bot
 * @param [timeout] time until the stop is forced. Null for no timeout
 * @returns resolves when the bot finishes stopping
 */
function stop(timeout) {
    // shuttingDown = true;
    bot.stop();
    client.destroy();
    logger_js_1.default.log("\nGracefully stopping...");
    let promise = new Promise(function (resolve) {
        if (bot.hasActiveAsyncRequests()) {
            logger_js_1.default.log("Waiting for asnyc requests to finish...");
            bot.events.on("doneasync", function () {
                if (!bot.hasActiveAsyncRequests()) {
                    logger_js_1.default.log("Async requests done");
                    resolve(true);
                }
            });
        }
        else {
            resolve(true);
        }
        if (timeout !== undefined) {
            setTimeout(function () {
                resolve(false);
                logger_js_1.default.warn("Stop handler timed out");
            }, timeout);
        }
    });
    return promise;
}
exports.stop = stop;
/**
 * Gets the local variable, bot
 * @returns bot
 */
function getBot() {
    return bot;
}
exports.getBot = getBot;
/**
 * Gets the default config
 * @returns default bot config
 */
function getDefaultConfig() {
    return defaultConfig;
}
exports.getDefaultConfig = getDefaultConfig;
const classes = {
    Bot: require("./bot/bot.js").default,
    BotCommand: require("./bot/command/command.js").default,
    BotCommandOptions: require("./bot/command/commandOptions.js").default,
    BotCommandHelp: require("./bot/command/commandHelp.js").default,
    events: require("./events.js"),
    Logger: require("./logger.js").default,
    Permissions: require("./permissions.js").default,
    BotPlugin: require("./bot/plugin/plugin.js").default,
    utils: require("./utils.js")
};
exports.classes = classes;
if (process.argv.slice(2).includes("--msgDebugMode")) {
    require("./msgDebugMode");
}
else if (require.main === module) { // if not being 'require'-d into something else
    require("./run-standalone");
}
