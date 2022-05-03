import { Card, JokerCard, NormalCard } from "./card";
import { Rank, Suit } from "./cardUtils";
declare class CardList {
    cards: Card[];
    constructor(cards: Card[]);
    [Symbol.iterator](): Iterator<Card>;
    add(card: Card): void;
    sortByRank(): void;
    sortBySuit(): void;
    getAllRank(rank: Rank): NormalCard[];
    getAllSuit(suit: Suit): NormalCard[];
    getAllJokers(): JokerCard[];
    shuffle(): void;
    getTopCard(): Card | undefined;
    takeTop(): Card | undefined;
    remove(card: Card): Card;
    get(index: number): Card;
    get size(): number;
}
export default CardList;
