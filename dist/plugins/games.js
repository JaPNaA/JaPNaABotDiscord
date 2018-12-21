"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_js_1 = __importDefault(require("../plugin.js"));
/**
 * @typedef {import("../events.js").DiscordMessageEvent} DiscordMessageEvent
 * @typedef {import("../bot/botHooks.js")} BotHooks
 */
/**
 * The weirder side of JaPNaABot
 */
class Game extends plugin_js_1.default {
    constructor(bot) {
        super(bot);
        this._pluginName = "game";
    }
    gPrecommandHandler() {
        //
    }
    game() {
        //
    }
    _start() {
        this._registerCommand("game", this.game);
        // this._registerEventHandler("message", this.onmessageHandler_lol);
    }
}
exports.default = Game;
