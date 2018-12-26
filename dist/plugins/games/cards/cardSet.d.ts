import { Card } from "./card";
import CardList from "./cardList";
declare class CardSet extends CardList {
    constructor(cards: Card[]);
}
export default CardSet;
