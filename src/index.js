const CONFIG_PATH = "./data/config.json";
const MEMORY_PATH = "./data/memory.json";
const ENV_PATH = "./data/.env";

const DISCORD = require("discord.io");
/** environment variables */
const ENV = require("./readenv.js")(ENV_PATH);
const FS = require("fs");

const Bot = require("./bot.js");

const client = new DISCORD.Client({
    token: ENV.token,
    autorun: true
});

let config;
try { // in case the config file doesn't exist
    config = JSON.parse(FS.readFileSync(CONFIG_PATH).toString());
} catch (e) {
    console.error(e);
    console.error("\x1B[91mconfig.json does not exist, or is corrupted.");
    process.exit(-1);
}

let memory;
try { // in case the memory file doesn't exist
    memory = JSON.parse(FS.readFileSync(MEMORY_PATH).toString());
} catch (e) {
    FS.writeFileSync(MEMORY_PATH, "{}");
    memory = {};
}

/**
 * Is the bot currently shutting down?
 * @type {Boolean}
 */
let shuttingDown = false;

/** @type {Bot} */
let bot;

/**
 * converts config.plugins paths to relative
 * @param {String} path input
 */
function getPluginPath(path) {
    const npath = "../plugins/" + path + ".js";
    delete require.cache[require.resolve(npath)];
    return require(npath);
}

/**
 * loads/reloads plugin
 * @param {String} path path from config.plugins
 * @returns {Error} any errors that may have occured
 */
function loadPlugin(path) {
    try {
        let plugin = new (getPluginPath(path))(bot);
        bot.registerPlugin(plugin);
        return null;
    } catch (e) {
        return e;
    }
}

/**
 * Initalizes and starts the bot with plugins
 */
function init() {
    config = JSON.parse(FS.readFileSync(CONFIG_PATH).toString());
    bot = new Bot(config, memory, MEMORY_PATH, client, init);

    for (let i of config["plugins"]) {
        const error = loadPlugin(i);

        if (error) {
            // send error message
            console.error(error);
        } else {
            console.log("Successfully loaded plugin " + i);
        }
    }
}

init();

// set hooks
client.on("ready", () => bot.onready());
client.on("message", (user, userId, channelId, message, event) => bot.onmessage(user, userId, channelId, message, event));
client.on("disconnect", function() {
    if (!shuttingDown) {
        client.connect();
    }
});

// gacefully stop on ctrl-c
process.on("SIGINT", function() {
    shuttingDown = true;
    bot.stop();
    client.disconnect();
    console.log("\nGracefully stoping...");

    setInterval(function () {
        // @ts-ignore
        if (!process._getActiveRequests().length) {
            process.exit(0);
        }
    }, 10);

    setTimeout(function() {
        process.exit(0);
        console.log("Stop handler timed out");
    }, 10000);
});