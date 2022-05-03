"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const player_1 = __importDefault(require("./player/player"));
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
        this.players.push(new player_1.default(this.bot, this.presidentsGame.game, userId));
    }
    getPlayer(userId) {
        return this.findPlayer(userId);
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
}
exports.default = PlayerHandler;
