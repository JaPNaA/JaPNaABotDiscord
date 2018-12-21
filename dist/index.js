"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const discord_js_1 = __importDefault(require("discord.js"));
const strip_json_comments_1 = __importDefault(require("strip-json-comments"));
const logger_js_1 = __importDefault(require("./logger.js"));
const bot_js_1 = __importDefault(require("./bot/bot.js"));
let client;
let bot;
let botHooks;
// let shuttingDown = false;
let defaultConfig = JSON.parse(strip_json_comments_1.default(fs_1.default.readFileSync(__dirname + "/../data/config.jsonc").toString()));
let runtimeConfig = {};
let memory;
// configureables
// ----------------------------------------------------------------------------------------
let memoryPath = "../data/memory.json";
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
    if (!configPath)
        return;
    let fileConfig = JSON.parse(strip_json_comments_1.default(fs_1.default.readFileSync(configPath).toString()));
    config = Object.assign({}, defaultConfig, _concatObject(fileConfig, runtimeConfig));
}
/**
 * Registers a plugin to auto-load
 * @param {String} path path to plugin
 */
function registerAutoloadPlugin(path) {
    if (runtimeConfig["externalPlugins"]) {
        runtimeConfig["externalPlugins"].push(path);
    }
    else {
        runtimeConfig["externalPlugins"] = [path];
    }
    loadPlugin(path);
}
/**
 * Registers a built-in plugin to auto-load
 * @param {String} name name of built-in plugin
 */
function registerAutoloadBuiltinPlugin(name) {
    if (runtimeConfig["builtinPlugins"]) {
        runtimeConfig["builtinPlugins"].push(name);
    }
    else {
        runtimeConfig["builtinPlugins"] = [name];
    }
    loadBuiltinPlugin(name);
}
/**
 * loads/reloads plugin
 * @param {String} path path to plugin
 * @returns {Error} any errors that may have occured while loading plugin
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
        bot.commandManager.register.plugin(plugin);
        logger_js_1.default.log("Successfully loaded external plugin", path);
        return null;
    }
    catch (e) {
        logger_js_1.default.error("Failed to load external plugin", path, "\n", e);
        return e;
    }
}
/**
 * loads/reloads a builtin plugin
 * @param {String} name name of builtin plugin
 * @returns {Error} any errors that may have occured while loading plugin
 */
function loadBuiltinPlugin(name) {
    let npath = "./plugins/" + name + ".js";
    // delete old plugin cache
    delete require.cache[require.resolve(npath)];
    try {
        let plugin = new (require(npath).default)(bot.hooks);
        bot.commandManager.register.plugin(plugin);
        logger_js_1.default.log("Successfully loaded built-in plugin", name);
        return null;
    }
    catch (e) {
        logger_js_1.default.error("Failed to load built-in plugin", name, "\n", e);
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
/**
 * Stop the bot
 * @param {Number} [timeout] time until the stop is forced. Null for no timeout
 * @returns {Promise} resolves when the bot finishes stopping
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
/**
 * Gets the local variable, bot
 * @returns {Bot} bot
 */
function getBot() {
    return bot;
}
/**
 * Gets the default config
 * @returns {Object} default bot config
 */
function getDefaultConfig() {
    return defaultConfig;
}
exports.default = {
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