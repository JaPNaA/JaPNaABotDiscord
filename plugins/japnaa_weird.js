const BotPlugin = require("../src/plugin.js");

/**
 * @typedef {import("../src/events.js").DiscordMessageEvent} DiscordMessageEvent
 * @typedef {import("../src/bot.js")} Bot
 */

/**
 * The weirder side of JaPNaABot
 */
class JapnaaWeird extends BotPlugin {
    constructor(bot) {
        super(bot);

        this.lolRegexp = /(.*\s)?[l|\\/]+h?\W*(h|w)*[aeiouy0.]+(h|w)*w?\W*[l|\\/]+/;
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
                color: 0xF2495D,
                description: "**JaP is " + (args || "kewl") + "**"
            }
        });
    }

    /**
     * Listens for messages with 'lol' and deviations
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     */
    onmessageHandler_lol(bot, event) {
        if (this.lolRegexp.test(event.message) && !event.precommand) {
            bot.send(event.channelId, "lol");
        }
    }

    _start() {
        this._registerCommand("jap", this.jap);
        this._registerCommand("tetris", this.tetris);

        this._registerEventHandler("message", this.onmessageHandler_lol);
    }
}

module.exports = JapnaaWeird;


