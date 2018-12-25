import { Suit, Rank } from "./cardUtils";
declare abstract class Card {
    abstract joker: boolean;
    abstract is(card: Card): boolean;
    abstract isJoker(card: Card): boolean;
    abstract isSuit(suit: Suit): boolean;
    abstract isRank(rank: Rank): boolean;
    abstract toString(): string;
    abstract toShortString(): string;
    abstract toSymbol(): string;
    toShortMD(): string;
    abstract indexByRank(): number;
    abstract indexBySuit(): number;
}
declare class NormalCard extends Card {
    suit: Suit;
    rank: Rank;
    joker: false;
    constructor(suit: Suit, rank: Rank);
    is(card: Card): boolean;
    isJoker(): false;
    isSuit(suit: Suit): boolean;
    isRank(rank: Rank): boolean;
    toString(): string;
    toShortString(): string;
    toSymbol(): string;
    indexByRank(): number;
    indexBySuit(): number;
}
declare class JokerCard extends Card {
    joker: true;
    constructor();
    is(card: Card): boolean;
    isJoker(): true;
    isRank(): false;
    isSuit(): false;
    toString(): "Joker";
    toShortString(): "JK";
    toSymbol(): "\u{1F0CF}";
    indexByRank(): 0xFF;
    indexBySuit(): 0xFF;
}
export { Card, NormalCard, JokerCard };
