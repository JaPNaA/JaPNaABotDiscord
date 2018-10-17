const DISCORD = require("discord.io");
const ENV = require("./readenv.js")();
const FS = require("fs");

const Bot = require("./bot.js");

const client = new DISCORD.Client({
    token: ENV.token,
    autorun: true
});

let config = JSON.parse(FS.readFileSync("./config.json").toString());

/** @type {Bot} */
let bot;

function getPlugin(path) {
    const npath = "./plugins/" + path + ".js";
    delete require.cache[require.resolve(npath)];
    return require(npath);
}

function init() {
    config = JSON.parse(FS.readFileSync("./config.json").toString());
    bot = new Bot(config, client, init);

    for (let i of config["plugins"]) {
        bot.registerPlugin(
            new (getPlugin(i))(bot)
        );
    }
}

init();

client.on("ready", event => bot.onready(event));
client.on("message", (user, userId, channelId, message, event) => bot.onmessage(user, userId, channelId, message, event));