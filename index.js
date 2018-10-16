const Bot = require("./bot.js");

const bot = new Bot();

bot.registerCommand("echo", function(bot, event, args) {
    bot.send(event.channelId, args);
});
