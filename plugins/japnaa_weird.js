const BotPlugin = require("../lib/plugin.js");

/**
 * @typedef {import("../lib/events.js").DiscordMessageEvent} DiscordMessageEvent
 * @typedef {import("../lib/bot/bot.js")} Bot
 */

/**
 * The weirder side of JaPNaABot
 */
class JapnaaWeird extends BotPlugin {
    constructor(bot) {
        super(bot);
        this._pluginName = "japnaaweird";

        this.lolRegexp = /(\s*[l|\\/]+\s*)+\W*((h|w)*([aeiouy0.=]|(?!\s)\W)+(h|w)*)\W*[l|\\/]+/i;
    }

    /**
     * Tetris is a racing game.
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args What type of game is Tetris?
     */
    tetris(bot, event, args) {
        bot.send(event.channelId, "**Tetris is a " + (args || "racing") + " game**");
    }

    /**
     * JaP is kewl
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args What is JaP?
     */
    jap(bot, event, args) {
        bot.send(event.channelId, {
            embed: {
                color: bot.config.themeColor,
                description: "**JaP is " + (args || "kewl") + "**"
            }
        });
    }

    /**
     * ebola your parabola
     * @param {Bot} bot
     * @param {DiscordMessageEvent} event message event
     */
    your(bot, event) {
        bot.send(event.channelId, "parabola");
    }

    /**
     * Listens for messages with 'lol' and deviations
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     */
    onmessageHandler_lol(bot, event) {
        if (
            !event.precommand && // is not a command
            !bot.getUser(event.userId).bot && // sender is not a bot
            this.lolRegexp.test(event.message) // contains valid 'lol'
        ) {
            bot.send(event.channelId, "lol");
        }
    }

    _start() {
        this._registerCommand("jap", this.jap);
        this._registerCommand("tetris", this.tetris);
        this._registerCommand("your", this.your);

        this._registerEventHandler("message", this.onmessageHandler_lol);

        this.bot.events.addEventListener("start",
            /** @this {JapnaaWeird} */
            function () {
                this.bot.presenceSetWatch("you");
            }.bind(this));
    }
}

module.exports = JapnaaWeird;