class BotPlugin {
    constructor(bot) {
        this.bot = bot;
    }
    _start() {}
    _stop() {}
    _registerCommand(name, func) {
        this.bot.registerCommand(name, func.bind(this));
    }
}

module.exports = BotPlugin;