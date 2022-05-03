"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cardList_1 = __importDefault(require("../../utils/cards/cardList"));
class PlayerCards {
    cards;
    constructor() {
        this.cards = new cardList_1.default([]);
    }
    sort() {
        this.cards.sortByRank();
    }
    add(card) {
        this.cards.add(card);
    }
    getRank(rank, amount) {
        const cards = this.cards.getAllRank(rank);
        // must be normal card, since jokercards don't have a rank
        return cards.slice(0, amount);
    }
    getJoker() {
        return this.cards.getAllJokers()[0];
    }
    removeCards(cards) {
        for (let card of cards) {
            this.cards.remove(card);
        }
    }
}
exports.default = PlayerCards;
