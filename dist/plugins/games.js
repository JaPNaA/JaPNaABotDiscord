"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_js_1 = __importDefault(require("../main/bot/plugin/plugin.js"));
const slapjack_js_1 = __importDefault(require("./games/slapjack.js"));
/**
 * Games!
 */
class Games extends plugin_js_1.default {
    constructor(bot) {
        super(bot);
        this._pluginName = "games";
        this.config = bot.config.getPlugin(this._pluginName);
        this.precommand = this._registerPrecommand(this.config.precommand);
        this.currentGames = new Map();
    }
    gPrecommandHandler(event) {
        this.bot.send(event.channelId, event.message);
    }
    game(bot, event, args) {
        const game = new slapjack_js_1.default(this.bot, event.channelId);
        this.currentGames.set(event.channelId, game);
        game._start();
    }
    unknownCommandHandler(bot, event) {
        let gameInChannel = this.currentGames.get(event.channelId);
        if (gameInChannel) {
            gameInChannel.commandManager.dispatch.onMessage(event);
        }
        else {
            bot.send(event.channelId, "lol that doesn't exist!1!! (and no game is running)!!");
        }
    }
    _start() {
        this._registerCommand(this.precommand, "game", this.game);
        this._registerUnknownCommandHandler(this.precommand, this.unknownCommandHandler);
    }
    _stop() {
        // do nothing
    }
}
exports.default = Games;
