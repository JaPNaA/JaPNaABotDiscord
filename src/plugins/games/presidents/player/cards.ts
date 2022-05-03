import { Card, NormalCard, JokerCard } from "../../utils/cards/card";

import { Rank } from "../../utils/cards/cardUtils";
import CardList from "../../utils/cards/cardList";
import CardSet from "../../utils/cards/cardSet";

class PlayerCards {
    cards: CardList;

    constructor() {
        this.cards = new CardList([]);
    }

    public sort() {
        this.cards.sortByRank();
    }

    public add(card: Card) {
        this.cards.add(card);
    }

    public getRank(rank: Rank, amount: number): NormalCard[] {
        const cards = this.cards.getAllRank(rank);

        // must be normal card, since jokercards don't have a rank
        return cards.slice(0, amount) as NormalCard[];
    }

    public getJoker(): JokerCard | undefined {
        return this.cards.getAllJokers()[0];
    }

    public removeCards(cards: CardSet): void {
        for (let card of cards) {
            this.cards.remove(card);
        }
    }
}

export default PlayerCards;