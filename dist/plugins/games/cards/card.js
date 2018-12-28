"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cardUtils_1 = require("./cardUtils");
class Card {
    toShortMD() {
        return " `" + this.toShortString() + "` ";
    }
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
    isJoker() {
        return false;
    }
    isSuit(suit) {
        return this.suit === suit;
    }
    isRank(rank) {
        return this.rank === rank;
    }
    toString() {
        return cardUtils_1.rankToString(this.rank) +
            " of " + cardUtils_1.suitToString(this.suit);
    }
    toShortString() {
        return cardUtils_1.suitToSymbol(this.suit) + cardUtils_1.rankToShortString(this.rank);
    }
    toSymbol() {
        return cardUtils_1.toSymbol(this.suit, this.rank);
    }
    indexByRank() {
        return cardUtils_1.rankToInt(this.rank) * 0x10 +
            cardUtils_1.suitToInt(this.suit);
    }
    indexBySuit() {
        return cardUtils_1.suitToInt(this.suit) * 0x10 +
            cardUtils_1.rankToInt(this.rank);
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
    isJoker() {
        return true;
    }
    isRank() {
        return false;
    }
    isSuit() {
        return false;
    }
    toString() {
        return "Joker";
    }
    toShortString() {
        return "JK";
    }
    toSymbol() {
        return "\u{1F0CF}";
    }
    indexByRank() {
        return 0xFF;
    }
    indexBySuit() {
        return 0xFF;
    }
}
exports.JokerCard = JokerCard;
