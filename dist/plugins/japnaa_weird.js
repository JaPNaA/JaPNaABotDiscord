"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_js_1 = __importDefault(require("../plugin.js"));
/**
 * The weirder side of JaPNaABot
 */
class JapnaaWeird extends plugin_js_1.default {
    constructor(bot) {
        super(bot);
        this.lolRegexp = /(\s*[l|\\/]+\s*)+\W*((h|w)*([aeiouy0.=]|(?!\s)\W)+(h|w)*)\W*[l|\\/]+/i;
        this._pluginName = "japnaaweird";
    }
    /**
     * Tetris is a racing game.
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args What type of game is Tetris?
     */
    tetris(bot, event, args) {
        bot.send(event.channelId, "**Tetris is a " + (args || "racing") + " game**");
    }
    /**
     * JaP is kewl
     * @param {BotHooks} bot bot
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
     * @param {BotHooks} bot
     * @param {DiscordMessageEvent} event message event
     */
    your(bot, event) {
        bot.send(event.channelId, "parabola");
    }
    /**
     * Listens for messages with 'lol' and deviations
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     */
    onmessageHandler_lol(bot, event) {
        const user = bot.getUser(event.userId);
        if (!event.precommand && // is not a command
            user && !user.bot && // sender is not a bot
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
        this.bot.events.on("start", function () {
            this.bot.client.presence.setWatch("you");
        }.bind(this));
    }
}
exports.default = JapnaaWeird;
