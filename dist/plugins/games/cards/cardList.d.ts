import { Card } from "./card";
import { Rank, Suit } from "./cardUtils";
declare class CardList {
    cards: Card[];
    constructor(cards: Card[]);
    [Symbol.iterator](): Iterator<Card>;
    add(card: Card): void;
    sortByRank(): void;
    sortBySuit(): void;
    getAllRank(rank: Rank): Card[];
    getAllSuit(suit: Suit): Card[];
    getAllJokers(): Card[];
    shuffle(): void;
    getTopCard(): Card | undefined;
    takeTop(): Card | undefined;
    remove(card: Card): Card;
}
export default CardList;
