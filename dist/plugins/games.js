"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_js_1 = __importDefault(require("../main/bot/plugin/plugin.js"));
const slapjack_js_1 = __importDefault(require("./games/slapjack.js"));
const presidents_js_1 = __importDefault(require("./games/presidents/presidents.js"));
const commandOptions_js_1 = __importDefault(require("../main/bot/command/commandOptions.js"));
/**
 * Games!
 */
class Games extends plugin_js_1.default {
    constructor(bot) {
        super(bot);
        this.gameAliases = {
            "slapjack": slapjack_js_1.default,
            "slap jack": slapjack_js_1.default,
            "president": presidents_js_1.default,
            "presidents": presidents_js_1.default,
            "kings": presidents_js_1.default,
            "scum": presidents_js_1.default
        };
        this._pluginName = "games";
        this.config = bot.config.getPlugin(this._pluginName);
        this.precommand = this._registerPrecommand(this.config.precommand);
        this.currentGames = new Map();
        this.playerGameMap = new Map();
    }
    _isDMLockAvailable(userId) {
        return this.playerGameMap.get(userId) === undefined;
    }
    _lockAndGetDMHandle(userId, game) {
        if (this._isDMLockAvailable(userId)) {
            this.playerGameMap.set(userId, game);
        }
        else {
            throw new Error("Already locked");
        }
    }
    _unlockDMHandle(userId) {
        this.playerGameMap.delete(userId);
    }
    play(event) {
        let currentGame = this.currentGames.get(event.channelId);
        if (currentGame) {
            // TODO: confirm to end current game
            currentGame._stop();
        }
        let cleanedArgs = event.arguments.trim().toLowerCase();
        const gameClass = this._getGame(cleanedArgs);
        if (gameClass) {
            let game = new gameClass(this.bot, this, event.channelId, event.userId);
            this.currentGames.set(event.channelId, game);
            game._start();
        }
        else {
            this.bot.client.send(event.channelId, "That game doesn't exist :confused:\n" +
                "Games available: " + this._listGames().join(", "));
        }
    }
    _getGame(name) {
        return this.gameAliases[name];
    }
    _start() {
        this._registerCommand(this.precommand, "play", this.play, new commandOptions_js_1.default({
            noDM: true
        }));
        this._registerUnknownCommandHandler(this.precommand, this.unknownCommandHandler);
    }
    unknownCommandHandler(bot, event) {
        if (event.isDM) {
            this._forwardToGameFromDM(bot, event);
        }
        else {
            this._forwardToGameInChannel(bot, event);
        }
    }
    _forwardToGameInChannel(bot, event) {
        let gameInChannel = this.currentGames.get(event.channelId);
        if (gameInChannel) {
            gameInChannel.commandManager.dispatch.onMessage(event);
        }
        else {
            this._sendDoesntExist(bot, event);
        }
    }
    _forwardToGameFromDM(bot, event) {
        let game = this.playerGameMap.get(event.userId);
        if (game) {
            game.commandManager.dispatch.onMessage(event);
        }
        else {
            this._sendDoesntExist(bot, event);
        }
    }
    _sendDoesntExist(bot, event) {
        bot.client.send(event.channelId, "No game is running...");
    }
    _listGames() {
        const set = new Set();
        const names = [];
        const potentialNames = Object.keys(this.gameAliases);
        for (const name of potentialNames) {
            if (!set.has(this.gameAliases[name])) {
                names.push(name);
                set.add(this.gameAliases[name]);
            }
        }
        return names;
    }
    _stop() {
        // do nothing
    }
}
exports.default = Games;
