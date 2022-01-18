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
    lolRegexp = /(\W|^)(([l1|\\!/\uff4c]|(\ud83c\uddf1))+)+[\W_]*((h|w)*([a@&\*eiouy0.=]|(\ud83c\udd7e\ufe0f)|(\ud83c\uddf4))+(h|w)*)[\W_]*([l1|\\!/\uff4c]|(\ud83c\uddf1))+(\W|$)/i;
    // note: original (aggressive) lol detection: /(\s*[l|\\!/]+\s*)+\W*((h|w)*([aeiouy0.=]|(?!\s)\W)+(h|w)*)\W*[l|\\!/]+/i
    l$wlRegexp = /(ЛЮЉ)|(([l1|\\!/\uff4c]|(\ud83c\uddf1))[\W_]*[e3🇪\uff45][\W_]*((vv)|[wu🇼ｗ])[\W_]*([l1|\\!/\uff4c]|(\ud83c\uddf1))[\W_]*)|((the[\W_]*)?absolute[\W_]*(value[\W_]*)?(of[\W_]*)?[e3🇪\uff45][\W_]*((vv)|[wu🇼ｗ]))/gi;
    constructor(bot) {
        super(bot);
        this._pluginName = "japnaaweird";
    }
    /**
     * Tetris is a racing game.
     */
    tetris(event) {
        this.bot.client.send(event.channelId, "**Tetris is a " + (event.arguments || "racing") + " game**");
    }
    /**
     * JaP is kewl
     */
    jap(event) {
        this.bot.client.send(event.channelId, {
            embed: {
                color: this.bot.config.themeColor,
                description: "**JaP is " + (event.arguments || "kewl") + "**"
            }
        });
    }
    /**
     * ebola your parabola
     */
    your(event) {
        this.bot.client.send(event.channelId, "parabola");
    }
    /**
     * Listens for messages with 'lol' and deviations
     */
    async onmessageHandler_lol(event) {
        if (!await this._isNaturalMessage(this.bot, event)) {
            return;
        }
        const numL$wl = this._countL$wl(event.message);
        if (numL$wl) {
            let str = "no ".repeat(numL$wl);
            this.bot.client.send(event.channelId, str);
        }
        else if (this.lolRegexp.test(event.message)) { // contains valid 'lol'
            this.bot.client.send(event.channelId, "lol");
        }
    }
    _countL$wl(str) {
        let i = 0;
        for (let match; match = this.l$wlRegexp.exec(str); i++) { }
        return i;
    }
    async _isNaturalMessage(bot, event) {
        const user = await bot.client.getUser(event.userId);
        return Boolean(!event.precommandName && // is not a command
            user && !user.bot);
    }
    _start() {
        this._registerDefaultCommand("jap", this.jap);
        this._registerDefaultCommand("tetris", this.tetris);
        this._registerDefaultCommand("your", this.your);
        this._registerEventHandler("message", this.onmessageHandler_lol);
        this.bot.events.on("start", function () {
            // this.bot.client.presence.setWatch("you");
            this.bot.client.presence.setGame("development");
        }.bind(this));
    }
    _stop() {
        // do nothing
    }
}
exports.default = JapnaaWeird;
