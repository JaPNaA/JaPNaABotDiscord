// @ts-ignore
if (require.main === module) {
    require("./run-standalone");
} else {
    main();
}

function main() {
    const FS = require("fs");
    let DISCORD = require("discord.io");
    let Logger = require("./logger.js");
    let Bot = require("./bot.js");
    
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
     * @param {String} path path from config.plugins
     * @returns {Error} any errors that may have occured
     */
    function loadPlugin(path) {
        try {
            let plugin = new (require(path))(bot);
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
     * @param {Number|null} timeout time untill the stop is forced. Null for no timeout
     * @returns {Promise} resolves when the bot finishes stopping
     */
    function stop(timeout) {
        shuttingDown = true;
        bot.stop();
        client.disconnect();
        Logger.log("\nGracefully stoping...");

        let promise = new Promise(function(resolve, reject) {
            if (bot.hasActiveAsyncRequests()) {
                Logger.log("Waiting for asnyc requests to finish...");
    
                bot.addEventListener("doneasync", function () {
                    if (bot.hasActiveAsyncRequests()) {
                        Logger.log("Async requests done");
                        resolve(true);
                    }
                });
            } else {
                resolve(true);
            }
    
            if (timeout !== null) {
                setTimeout(function () {
                    reject("Timed out");
                    Logger.warn("Stop handler timed out");
                }, timeout);
            }
        });

        return promise;
    }

    module.exports = { loadPlugin, start, stop };
}