import { Suit, Rank, rankToString, suitToString, rankToShortString, suitToSymbol, toSymbol } from "./cardTypes";

abstract class Card {
    abstract joker: boolean;
    abstract is(card: Card): boolean;
    abstract toString(): string;
    abstract toShortString(): string;
    abstract toShortMD(): string;
    abstract toSymbol(): string;
}

class NormalCard extends Card {
    suit: Suit;
    rank: Rank;
    joker: false = false;

    constructor(suit: Suit, rank: Rank) {
        super();

        this.suit = suit;
        this.rank = rank;
    }

    is(card: Card): boolean {
        if (card instanceof NormalCard) {
            return (
                card.joker == this.joker &&
                card.suit == this.suit &&
                card.rank == this.rank
            );
        } else {
            return false;
        }
    }

    toString(): string {
        return rankToString(this.rank) +
            " of " + suitToString(this.suit);
    }

    toShortString(): string {
        return suitToSymbol(this.suit) + rankToShortString(this.rank);
    }

    toShortMD(): string {
        return "`" + this.toShortString() + "`";
    }

    toSymbol(): string {
        return toSymbol(this.suit, this.rank);
    }
}

class JokerCard extends Card {
    joker: true = true;

    constructor() {
        super();
    }

    is(card: Card): boolean {
        return card.joker == this.joker;
    }

    toString(): "Joker" {
        return "Joker";
    }

    toShortString(): "JK" {
        return "JK";
    }

    toShortMD(): string {
        return "`" + this.toShortString() + "`";
    }

    toSymbol(): "\u{1F0CF}" {
        return "\u{1F0CF}";
    }
}


export { Card, NormalCard, JokerCard };