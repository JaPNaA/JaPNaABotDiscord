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

    let memoryPath = "./data/memory.json";

    let token = null;

    /** @type {DISCORD.Client} */
    let client = null;

    /** @type {Bot} */
    let bot = null;

    let config = null;
    let memory = null;

    let shuttingDown = false;


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
     */
    function start() {
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

    function stop() {
        shuttingDown = true;
        bot.stop();
        client.disconnect();
        Logger.log("\nGracefully stoping...");

        setInterval(function () {
            // @ts-ignore
            if (!process._getActiveRequests().length) {
                process.exit(0);
            }
        }, 10);

        setTimeout(function () {
            process.exit(0);
            Logger.warn("Stop handler timed out");
        }, 10000);
    }

    module.exports = { loadPlugin, start, stop };
}