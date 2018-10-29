const BotPlugin = require("../plugin.js");

class Default extends BotPlugin {
    constructor(bot) {
        super(bot);
    }

    ping(bot, event, args) {
        bot.send(event.channelId, "Pong!");
    }

    link(bot, event, args) {
        bot.send(event.channelId, "You can add me to another server with this link: \n" + bot.config.addLink);
    }

    _start() {
        this._registerCommand("ping", this.ping);
        this._registerCommand("link", this.link);
    }
}

module.exports = Default;