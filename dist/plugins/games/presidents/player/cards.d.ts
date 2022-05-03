import { Card, NormalCard, JokerCard } from "../../utils/cards/card";
import { Rank } from "../../utils/cards/cardUtils";
import CardList from "../../utils/cards/cardList";
import CardSet from "../../utils/cards/cardSet";
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
