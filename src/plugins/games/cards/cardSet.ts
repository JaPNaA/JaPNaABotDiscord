import { Card } from "./card";
import CardList from "./cardList";

class CardSet extends CardList {
    constructor(cards: Card[]) {
        super(cards);
    }
}

export default CardSet;