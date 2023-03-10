import { Suit, Rank, rankToString, suitToString, rankToShortString, suitToSymbol, toSymbol, rankToInt, suitToInt } from "./cardUtils";

abstract class Card {
    abstract joker: boolean;
    
    abstract is(card: Card): boolean;
    abstract isJoker(): boolean;
    abstract isSuit(suit: Suit): boolean;
    abstract isRank(rank: Rank): boolean;

    abstract toString(): string;
    abstract toShortString(): string;
    abstract toSymbol(): string;
    toShortMD(): string {
        return " `" + this.toShortString() + "` ";
    }

    abstract indexByRank(): number;
    abstract indexBySuit(): number;
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

    isJoker(): false {
        return false;
    }

    isSuit(suit: Suit): boolean {
        return this.suit === suit;
    }

    isRank(rank: Rank): boolean {
        return this.rank === rank;
    }

    toString(): string {
        return rankToString(this.rank) +
            " of " + suitToString(this.suit);
    }

    toShortString(): string {
        return suitToSymbol(this.suit) + rankToShortString(this.rank);
    }

    toSymbol(): string {
        return toSymbol(this.suit, this.rank);
    }

    indexByRank(): number {
        return rankToInt(this.rank) * 0x10 +
            suitToInt(this.suit);
    }

    indexBySuit(): number {
        return suitToInt(this.suit) * 0x10 +
            rankToInt(this.rank);
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

    isJoker(): true {
        return true;
    }

    isRank(): false {
        return false;
    }

    isSuit(): false {
        return false;
    }

    toString(): "Joker" {
        return "Joker";
    }

    toShortString(): "JK" {
        return "JK";
    }

    toSymbol(): "\u{1F0CF}" {
        return "\u{1F0CF}";
    }

    indexByRank(): 0xFF {
        return 0xFF;
    }
    indexBySuit(): 0xFF {
        return 0xFF;
    }
}


export { Card, NormalCard, JokerCard };