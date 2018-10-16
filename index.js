const DISCORD = require("discord.io");
const ENV = require("./readenv.js")();
const Bot = require("./bot.js");

const client = new DISCORD.Client({
    token: ENV.token,
    autorun: true
});

client.on("ready", function() {
    console.log("ready");
});

client.on("message", function(user, userId, channelId, message, event) {
    client.sendMessage({
        to: channelId,
        message: "lol"
    });
});