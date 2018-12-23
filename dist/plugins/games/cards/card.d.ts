import { Suit, Rank } from "./cardTypes";
declare abstract class Card {
    abstract joker: boolean;
    abstract is(card: Card): boolean;
    abstract toString(): string;
    abstract toShortString(): string;
    abstract toShortMD(): string;
    abstract toSymbol(): string;
}
declare class NormalCard extends Card {
    suit: Suit;
    rank: Rank;
    joker: false;
    constructor(suit: Suit, rank: Rank);
    is(card: Card): boolean;
    toString(): string;
    toShortString(): string;
    toShortMD(): string;
    toSymbol(): string;
}
declare class JokerCard extends Card {
    joker: true;
    constructor();
    is(card: Card): boolean;
    toString(): "Joker";
    toShortString(): "JK";
    toShortMD(): string;
    toSymbol(): "\u{1F0CF}";
}
export { Card, NormalCard, JokerCard };
