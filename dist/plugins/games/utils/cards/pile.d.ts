import { Card } from "./card";
import CardSet from "./cardSet";
import CardList from "./cardList";
declare class Pile extends CardList {
    sets: CardSet[];
    constructor();
    add(set: CardSet): void;
    add(card: Card): void;
    getTopSet(): CardSet | undefined;
}
export default Pile;
