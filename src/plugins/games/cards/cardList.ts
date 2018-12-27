import { Card, JokerCard, NormalCard } from "./card";
import { Rank, Suit } from "./cardUtils";

class CardList {
    cards: Card[];

    constructor(cards: Card[]) {
        this.cards = cards;
    }

    public *[Symbol.iterator](): Iterator<Card> {
        for (let card of this.cards) {
            yield card;
        }
    }

    public add(card: Card): void;

    public add(card: Card): void {
        this.cards.push(card);
    }

    public sortByRank() {
        this.cards = this.cards.sort(
            (a, b) => a.indexByRank() - b.indexByRank()
        );
    }

    public sortBySuit() {
        this.cards = this.cards.sort(
            (a, b) => a.indexBySuit() - b.indexBySuit()
        );
    }

    public getAllRank(rank: Rank): NormalCard[] {
        return this.cards.filter(card => card.isRank(rank)) as NormalCard[];
    }

    public getAllSuit(suit: Suit): NormalCard[] {
        return this.cards.filter(card => card.isSuit(suit)) as NormalCard[];
    }

    public getAllJokers(): JokerCard[] {
        return this.cards.filter(card => card.joker) as JokerCard[];
    }

    public shuffle() {
        let newCards: Card[] = [];

        while (this.cards.length > 0) {
            let rand = Math.floor(Math.random() * this.cards.length);
            let card = this.cards.splice(rand, 1);
            newCards.push(...card);
        }

        this.cards = newCards;
    }

    public getTopCard(): Card | undefined {
        return this.cards[this.cards.length - 1];
    }

    public takeTop(): Card | undefined {
        let card: Card | undefined = this.cards.pop();
        return card;
    }

    public remove(card: Card): Card {
        const index = this.cards.findIndex(e => e.is(card));
        if (index < 0) { throw new Error("Cannot remove non-existant card"); }
        return this.cards.splice(index, 1)[0];
    }

    public get(index: number): Card {
        return this.cards[index];
    }

    public get size(): number {
        return this.cards.length;
    }
}

export default CardList;