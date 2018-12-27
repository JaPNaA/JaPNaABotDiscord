import { Card, NormalCard, JokerCard } from "../../cards/card";
import { Rank } from "../../cards/cardUtils";
import CardList from "../../cards/cardList";
import CardSet from "../../cards/cardSet";
declare class PlayerCards {
    cards: CardList;
    constructor();
    sort(): void;
    add(card: Card): void;
    getRank(rank: Rank, amount: number): NormalCard[];
    getJoker(): JokerCard | undefined;
    removeCards(cards: CardSet): void;
}
export default PlayerCards;
