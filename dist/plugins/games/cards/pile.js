"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Pile {
    constructor() {
        this.cards = [];
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
    shuffle() {
        let newCards = [];
        while (this.cards.length > 0) {
            let rand = Math.floor(Math.random() * this.cards.length);
            let card = this.cards.splice(rand, 1);
            newCards.push(...card);
        }
        this.cards = newCards;
    }
    takeTop() {
        let card = this.cards.pop();
        return card;
    }
}
exports.default = Pile;
