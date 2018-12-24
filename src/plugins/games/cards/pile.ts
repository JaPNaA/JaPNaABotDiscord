import { Card } from "./card";

class Pile {
    cards: Card[];

    constructor() {
        this.cards = [];
    }

    public *[Symbol.iterator](): Iterator<Card> {
        for (let card of this.cards) {
            yield card;
        }
    }

    public add(card: Card) {
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

    public shuffle() {
        let newCards: Card[] = [];

        while (this.cards.length > 0) {
            let rand = Math.floor(Math.random() * this.cards.length);
            let card = this.cards.splice(rand, 1);
            newCards.push(...card);
        }

        this.cards = newCards;
    }

    public takeTop(): Card | undefined {
        let card: Card | undefined = this.cards.pop();
        return card;
    }
}

export default Pile;