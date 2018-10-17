const BotPlugin = require("../plugin.js");

class Japnaa extends BotPlugin {
    constructor(bot) {
        super(bot);

        this.counter = 1;
    }

    count(bot, event, args) {
        this.counter++;

        bot.send(event.channelId, this.counter.toString() + ", lol not a number! get rekt.");
    }

    jap(bot, event, args) {
        bot.send(event.channelId, "**JaP is " + (args || "kewl") + "**");
    };

    echo(bot, event, args) {
        bot.send(event.channelId, args);
    }

    _start() {
        this.bot.registerCommand("echo", this.echo);
        this.bot.registerCommand("jap", this.jap);
        this.bot.registerCommand("count", this.count);
    }
}

module.exports = Japnaa;