function main() {
    const FS = require("fs");
    const PATH = require("path");
    const DISCORD = require("discord.io");
    const STRIP_JSON_COMMENTS = require("strip-json-comments");
    const Logger = require("./logger.js");
    const Bot = require("./bot.js");

    /** @type {DISCORD.Client} */
    let client = null;

    /** @type {Bot} */
    let bot = null;

    let shuttingDown = false;

    let defaultConfig = JSON.parse(
        STRIP_JSON_COMMENTS(FS.readFileSync(__dirname + "/../data/config.jsonc").toString())
    );
    let memory = null;
    
    // configureables
    // ----------------------------------------------------------------------------------------
    let memoryPath = "../data/memory.json";
    
    /** @type {String} */
    let token = null;
    /** @type {Object} */
    let config = null;
    /** @type {String|null} */
    let configPath = null;
    
    /**
     * Initializes the bot
     */
    function _init() {
        _getConfigFromPath();
        bot = new Bot(config, memory, memoryPath, client, _init);
        
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
     * Sets the config to the contents of the config file
     */
    function _getConfigFromPath() {
        if (!configPath) return;

        let fileConfig = JSON.parse(STRIP_JSON_COMMENTS(FS.readFileSync(configPath).toString()));
        config = {
            ...defaultConfig,
            ...fileConfig
        };
    }
    
    /**
     * loads/reloads plugin
     * @param {String} path path to plugin
     * @returns {Error} any errors that may have occured while loading plugin
     */
    function loadPlugin(path) {
        let npath = PATH.join(PATH.dirname(require.main.filename), path);

        // delete old plugin cache
        delete require.cache[require.resolve(npath)];

        try {
            let plugin = new (require(npath))(bot);
            bot.registerPlugin(plugin);

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
    function loadBuiltinPlugin(name) {
        let npath = "../plugins/" + name + ".js";

        // delete old plugin cache
        delete require.cache[require.resolve(npath)];

        try {
            let plugin = new (require(npath))(bot);
            bot.registerPlugin(plugin);
            
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
    function start(apiToken, botConfig, pathToMemoryFile) {
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
            token: token,
            autorun: true
        });

        client.on("ready", () => bot.onready());
        client.on("message", (user, userId, channelId, message, event) =>
            bot.onmessage(user, userId, channelId, message, event));
        client.on("disconnect", function () {
            if (!shuttingDown) {
                client.connect();
            }
        });

        try { // in case the memory file doesn't exist
            memory = JSON.parse(FS.readFileSync(memoryPath).toString());
        } catch (e) {
            FS.writeFileSync(memoryPath, "{}");
            memory = {};
        }

        shuttingDown = false;

        _init();
    }

    /**
     * Stop the bot
     * @param {Number} [timeout] time until the stop is forced. Null for no timeout
     * @returns {Promise} resolves when the bot finishes stopping
     */
    function stop(timeout) {
        shuttingDown = true;
        bot.stop();
        client.disconnect();
        Logger.log("\nGracefully stoping...");

        let promise = new Promise(function (resolve) {
            if (bot.hasActiveAsyncRequests()) {
                Logger.log("Waiting for asnyc requests to finish...");

                bot.addEventListener("doneasync", function () {
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

    module.exports = {
        loadPlugin, loadBuiltinPlugin, start, stop, 
        getBot, getDefaultConfig,

        Bot: require("./bot.js"),
        BotCommand: require("./botcommand.js"),
        BotCommandOptions: require("./botcommandOptions.js"),
        events: require("./events.js"),
        Logger: require("./logger.js"),
        Permissions: require("./permissions.js"),
        BotPlugin: require("./plugin.js"),
        utils: require("./utils.js")
    };
}

main();

// @ts-ignore
if (require.main === module) { // if not being 'require'-d into something else
    require("./run-standalone");
}