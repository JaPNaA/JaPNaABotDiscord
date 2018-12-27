"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cardList_1 = __importDefault(require("../cards/cardList"));
const cardUtils_1 = require("../cards/cardUtils");
class PlayerCards {
    constructor() {
        this.cards = new cardList_1.default([]);
    }
    sort() {
        this.cards.sortByRank();
    }
    add(card) {
        this.cards.add(card);
    }
    countJokers() {
        return this.cards.getAllJokers().length;
    }
    count(rank) {
        return this.cards.getAllRank(rank).length;
    }
    hasRank(rank, amount) {
        let count = this.count(rank);
        if (count >= amount) {
            return true;
        }
        else {
            return false;
        }
    }
    hasJokers(amount) {
        let count = this.countJokers();
        if (count >= amount) {
            return true;
        }
        else {
            return false;
        }
    }
    removeRank(rank, amount) {
        let cards = this.cards.getAllRank(rank).slice(0, amount);
        this.removeCards(cards, amount);
        return cards;
    }
    removeJoker(amount) {
        let cards = this.cards.getAllJokers().slice(0, amount);
        this.removeCards(cards, amount);
        return cards;
    }
    removeCards(cards, amount) {
        if (cards.length < amount) {
            throw new Error("Not enough cards");
        }
        for (let card of cards) {
            this.cards.remove(card);
        }
    }
    separateBurnAndNormalCards() {
        let normalCards = [];
        let burnCards = [];
        for (let card of this.cards) {
            if (card.isRank(cardUtils_1.Rank.n2) || card.isJoker()) {
                burnCards.push(card);
            }
            else {
                normalCards.push(card);
            }
        }
        return { burnCards: burnCards, normalCards: normalCards };
    }
}
class Player {
    constructor(botHooks, userId) {
        this.bot = botHooks;
        this.userId = userId;
        this.cards = new PlayerCards();
    }
    sendCards() {
        let cardStr = "";
        for (let card of this.cards.cards) {
            cardStr += card.toShortMD();
        }
        this.bot.sendDM(this.userId, cardStr);
    }
}
exports.default = Player;
