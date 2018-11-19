// @ts-ignore
if (require.main === module) {
    require("./run-standalone");
} else {
    main();
}

function main() {
    const FS = require("fs");
    const PATH = require("path");
    const DISCORD = require("discord.io");
    const Logger = require("./logger.js");
    const Bot = require("./bot.js");

    /** @type {DISCORD.Client} */
    let client = null;

    /** @type {Bot} */
    let bot = null;

    let shuttingDown = false;

    let memory = null;

    // configureable
    // ----------------------------------------------------------------------------------------
    let memoryPath = "./data/memory.json";
    let token = null;
    let config = null;

    /**
     * Initializes the bot
     */
    function _init() {
        bot = new Bot(config, memory, memoryPath, client, _init);
    }

    /**
     * loads/reloads plugin
     * @param {String} path path to plugin
     * @returns {Error} any errors that may have occured
     */
    function loadPlugin(path) {
        let npath = PATH.join(PATH.dirname(require.main.filename), path);
        try {
            let plugin = new (require(npath))(bot);
            bot.registerPlugin(plugin);
            return null;
        } catch (e) {
            return e;
        }
    }

    /**
     * loads/reloads a builtin plugin
     * @param {String} name name of builtin plugin
     */
    function loadBuiltinPlugin(name) {
        try {
            let plugin = new (require("../plugins/" + name + ".js"))(bot);
            bot.registerPlugin(plugin);
            return null;
        } catch (e) {
            return e;
        }
    }

    /**
     * Starts the bot
     * @param {String} apiToken The Discord API token
     * @param {Object} botConfig The bot's config
     * @param {String} pathToMemoryFile the path to the memory file for the bot
     */
    function start(apiToken, botConfig, pathToMemoryFile) {
        token = apiToken;
        config = botConfig;
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
     * @param {Number} [timeout] time untill the stop is forced. Null for no timeout
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

    module.exports = {
        loadPlugin, loadBuiltinPlugin, start, stop,
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