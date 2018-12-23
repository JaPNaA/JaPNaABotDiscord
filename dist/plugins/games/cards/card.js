"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cardTypes_1 = require("./cardTypes");
class Card {
}
exports.Card = Card;
class NormalCard extends Card {
    constructor(suit, rank) {
        super();
        this.joker = false;
        this.suit = suit;
        this.rank = rank;
    }
    is(card) {
        if (card instanceof NormalCard) {
            return (card.joker == this.joker &&
                card.suit == this.suit &&
                card.rank == this.rank);
        }
        else {
            return false;
        }
    }
    toString() {
        return cardTypes_1.rankToString(this.rank) +
            " of " + cardTypes_1.suitToString(this.suit);
    }
    toShortString() {
        return cardTypes_1.suitToSymbol(this.suit) + cardTypes_1.rankToShortString(this.rank);
    }
    toShortMD() {
        return "`" + this.toShortString() + "`";
    }
    toSymbol() {
        return cardTypes_1.toSymbol(this.suit, this.rank);
    }
}
exports.NormalCard = NormalCard;
class JokerCard extends Card {
    constructor() {
        super();
        this.joker = true;
    }
    is(card) {
        return card.joker == this.joker;
    }
    toString() {
        return "Joker";
    }
    toShortString() {
        return "JK";
    }
    toShortMD() {
        return "`" + this.toShortString() + "`";
    }
    toSymbol() {
        return "\u{1F0CF}";
    }
}
exports.JokerCard = JokerCard;
