"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_js_1 = __importDefault(require("../main/bot/plugin/plugin.js"));
const deck_js_1 = __importDefault(require("./games/cards/deck.js"));
/**
 * Games!
 */
class Game extends plugin_js_1.default {
    constructor(bot) {
        super(bot);
        this._pluginName = "game";
        this.precommand = this._registerPrecommand("g!");
    }
    gPrecommandHandler(event) {
        this.bot.send(event.channelId, event.message);
    }
    game(bot, event, args) {
        let deck = new deck_js_1.default({
            excludeKnights: false
        });
        let str = "";
        for (let card of deck.cards) {
            str += card.toShortMD() + ", ";
        }
        bot.send(event.channelId, str);
    }
    _start() {
        this._registerCommand(this.precommand, "game", this.game);
    }
    _stop() {
        // do nothing
    }
}
exports.default = Game;
