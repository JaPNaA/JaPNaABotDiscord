"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CardList {
    cards;
    constructor(cards) {
        this.cards = cards;
    }
    *[Symbol.iterator]() {
        for (let card of this.cards) {
            yield card;
        }
    }
    add(card) {
        this.cards.push(card);
    }
    sortByRank() {
        this.cards = this.cards.sort((a, b) => a.indexByRank() - b.indexByRank());
    }
    sortBySuit() {
        this.cards = this.cards.sort((a, b) => a.indexBySuit() - b.indexBySuit());
    }
    getAllRank(rank) {
        return this.cards.filter(card => card.isRank(rank));
    }
    getAllSuit(suit) {
        return this.cards.filter(card => card.isSuit(suit));
    }
    getAllJokers() {
        return this.cards.filter(card => card.joker);
    }
    shuffle() {
        let newCards = [];
        while (this.cards.length > 0) {
            let rand = Math.floor(Math.random() * this.cards.length);
            let card = this.cards.splice(rand, 1);
            newCards.push(...card);
        }
        this.cards = newCards;
    }
    getTopCard() {
        return this.cards[this.cards.length - 1];
    }
    takeTop() {
        let card = this.cards.pop();
        return card;
    }
    remove(card) {
        const index = this.cards.findIndex(e => e.is(card));
        if (index < 0) {
            throw new Error("Cannot remove non-existant card");
        }
        return this.cards.splice(index, 1)[0];
    }
    get(index) {
        return this.cards[index];
    }
    get size() {
        return this.cards.length;
    }
}
exports.default = CardList;
