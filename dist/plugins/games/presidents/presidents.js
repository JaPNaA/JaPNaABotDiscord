"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const game_1 = __importDefault(require("../game"));
const game_2 = __importDefault(require("./game"));
const messageType_1 = __importDefault(require("./messageType"));
const lobby_1 = __importDefault(require("../utils/lobby"));
/**
 * Handles leaving and joining of Presidents, as long as some aliases to other
 * components
 */
class Presidents extends game_1.default {
    _gamePluginName = "presidents";
    pluginName = "game." + this._gamePluginName;
    gameName = "Presidents";
    initer;
    game;
    lobby = new lobby_1.default(this, this.bot);
    constructor(bot, parentPlugin, channelId, initer) {
        super(bot, parentPlugin, channelId);
        this.gameName = "Presidents";
        this._gamePluginName = "presidents";
        this.pluginName = "game." + this._gamePluginName;
        this.initer = initer;
        this.lobby.setSettings({
            minPlayers: 1,
            description: "The ultimate social card game.",
            dmLock: true
        });
        this.game = new game_2.default(this.bot, this.parentPlugin, this);
    }
    playerUse(event) {
        this.game.messageHandler.onMessage(event.userId, event, messageType_1.default.use);
    }
    playerPass(event) {
        this.game.messageHandler.onMessage(event.userId, event, messageType_1.default.pass);
    }
    _startGame() {
        this.game.start();
    }
    async _start() {
        this._registerCommand(this.commandManager, "use", this.playerUse);
        this._registerCommand(this.commandManager, "pass", this.playerPass);
        this.lobby.addPlayer(this.initer);
        const players = await this.lobby.getPlayers();
        for (const player of players) {
            this.game.playerHandler.addPlayer(player);
        }
    }
    _stop() {
        this.lobby.removeAllPlayers();
    }
}
exports.default = Presidents;
