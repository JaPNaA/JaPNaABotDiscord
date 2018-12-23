"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_js_1 = __importDefault(require("../main/bot/plugin/plugin.js"));
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
     */
    tetris(bot, event, args) {
        bot.send(event.channelId, "**Tetris is a " + (args || "racing") + " game**");
    }
    /**
     * JaP is kewl
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
     */
    your(bot, event) {
        bot.send(event.channelId, "parabola");
    }
    /**
     * Listens for messages with 'lol' and deviations
     */
    onmessageHandler_lol(bot, event) {
        const user = bot.getUser(event.userId);
        if (!event.precommandName && // is not a command
            user && !user.bot && // sender is not a bot
            this.lolRegexp.test(event.message) // contains valid 'lol'
        ) {
            bot.send(event.channelId, "lol");
        }
    }
    _start() {
        this._registerDefaultCommand("jap", this.jap);
        this._registerDefaultCommand("tetris", this.tetris);
        this._registerDefaultCommand("your", this.your);
        this._registerEventHandler("message", this.onmessageHandler_lol);
        this.bot.events.on("start", function () {
            this.bot.client.presence.setWatch("you");
        }.bind(this));
    }
    _stop() {
        // do nothing
    }
}
exports.default = JapnaaWeird;
