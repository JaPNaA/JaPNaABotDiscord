import { Card } from "./card";
import CardSet from "./cardSet";
import CardList from "./cardList";

class Pile extends CardList {
    sets: CardSet[];

    constructor() {
        super([]);
        this.sets = [];
    }

    public add(set: CardSet): void;
    public add(card: Card): void;

    public add(setOrCard: CardSet | Card): void {
        let set: CardSet;
        if (setOrCard instanceof CardSet) {
            set = setOrCard;
        } else {
            set = new CardSet([setOrCard]);
        }

        this.cards.push(...set.cards);
        this.sets.push(set);
    }

    public getTopSet(): CardSet | undefined {
        return this.sets[this.sets.length - 1];
    }
}

export default Pile;