"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../errors");
const cardSet_1 = __importDefault(require("../../utils/cards/cardSet"));
class PlayerAction {
    player;
    logic;
    constructor(player, gameLogic) {
        this.player = player;
        this.logic = gameLogic;
    }
    beforeTurn() {
        this.logic.beforePlayerTurn(this.player);
    }
    pass() {
        this.logic.playerPass(this.player);
    }
    useJoker() {
        const set = this.createJokerSet();
        this.logic.playerUse(this.player, set);
        this.player.cards.removeCards(set);
    }
    useCards(rank, amount) {
        debugger;
        let ramount = amount;
        let requiredAmount = this.logic.getRequiredAmountNormalCard(rank);
        if (!amount) {
            if (!requiredAmount) {
                ramount = this.player.cards.cards.getAllRank(rank).length;
            }
            else {
                ramount = requiredAmount;
            }
        }
        const set = this.createSet(rank, ramount);
        this.logic.playerUse(this.player, set);
        this.player.cards.removeCards(set);
    }
    createJokerSet() {
        const joker = this.player.cards.getJoker();
        if (!joker) {
            throw new errors_1.MessageActionError("You do not have a joker.");
        }
        return new cardSet_1.default([joker]);
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
