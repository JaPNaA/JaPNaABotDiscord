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
        this.gameAliases = {
            "slapjack": slapjack_js_1.default,
            "slap jack": slapjack_js_1.default,
        };
        this._pluginName = "games";
        this.config = bot.config.getPlugin(this._pluginName);
        this.precommand = this._registerPrecommand(this.config.precommand);
        this.currentGames = new Map();
    }
    gPrecommandHandler(event) {
        this.bot.send(event.channelId, event.message);
    }
    play(bot, event, args) {
        let cleanedArgs = args.trim().toLowerCase();
        const gameClass = this._getGame(cleanedArgs);
        if (gameClass) {
            let game = new gameClass(this.bot, this, event.channelId);
            this.currentGames.set(event.channelId, game);
            game._start();
        }
        else {
            bot.send(event.channelId, "That game doesn't exist :confused:\n" +
                "```c\n// TODO: add way to list all games```");
        }
    }
    _getGame(name) {
        return this.gameAliases[name];
    }
    unknownCommandHandler(bot, event) {
        let gameInChannel = this.currentGames.get(event.channelId);
        if (gameInChannel) { // forward to the game
            gameInChannel.commandManager.dispatch.onMessage(event);
        }
        else {
            bot.send(event.channelId, "lol that doesn't exist!1!! (and no game is running)!!");
        }
    }
    _start() {
        this._registerCommand(this.precommand, "play", this.play);
        this._registerUnknownCommandHandler(this.precommand, this.unknownCommandHandler);
    }
    _stop() {
        // do nothing
    }
}
exports.default = Games;
