"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const player_1 = __importDefault(require("./player/player"));
const errors_1 = require("./errors");
class PlayerHandler {
    bot;
    parentGame;
    presidentsGame;
    players;
    constructor(bot, parentGame, presidentsGame) {
        this.bot = bot;
        this.parentGame = parentGame;
        this.presidentsGame = presidentsGame;
        this.players = [];
    }
    addPlayer(userId) {
        if (this.isPlayerListed(userId)) {
            throw new errors_1.AlreadyJoinedError();
        }
        if (!this.parentGame._isDMLockAvailable(userId)) {
            throw new errors_1.DMAlreadyLockedError();
        }
        this.parentGame._lockAndGetDMHandle(userId, this.presidentsGame);
        this.players.push(new player_1.default(this.bot, this.presidentsGame.game, userId));
    }
    removePlayer(userId) {
        let index = this.findPlayerIndex(userId);
        if (index < 0) {
            return false;
        }
        else {
            this.parentGame._unlockDMHandle(userId);
            this.players.splice(index, 1);
            return true;
        }
    }
    removeAllPlayers() {
        for (let player of this.players) {
            this.parentGame._unlockDMHandle(player.userId);
        }
        this.players.length = 0;
    }
    getPlayer(userId) {
        return this.findPlayer(userId);
    }
    isPlayerListed(userId) {
        let player = this.findPlayer(userId);
        if (player) {
            return true;
        }
        else {
            return false;
        }
    }
    findPlayer(userId) {
        let player = this.players.find(player => player.userId === userId);
        if (player) {
            return player;
        }
        else {
            return null;
        }
    }
    findPlayerIndex(userId) {
        return this.players.findIndex(player => player.userId == userId);
    }
}
exports.default = PlayerHandler;
