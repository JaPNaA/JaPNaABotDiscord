"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../errors");
const cardSet_1 = __importDefault(require("../../cards/cardSet"));
class PlayerAction {
    constructor(player, gameLogic) {
        this.player = player;
        this.logic = gameLogic;
    }
    useJoker() {
    }
    useCards(rank, amount) {
        if (isNaN(amount) || amount <= 0) {
            throw new errors_1.MessageSyntaxError("Amount is invalid");
        }
        const set = this.createSet(rank, amount);
        this.logic.playerUse(set);
        this.player.cards.removeCards(set);
    }
    createSet(rank, amount) {
        const cards = this.player.cards.getRank(rank, amount);
        if (cards.length < amount) {
            throw new errors_1.MessageActionError("You do not have enough cards.");
        }
        const set = new cardSet_1.default(cards);
        return set;
    }
}
exports.default = PlayerAction;
