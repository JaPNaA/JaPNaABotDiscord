import { Card } from "./card";
import CardList from "./cardList";
declare class CardSet extends CardList {
    constructor(cards: Card[]);
    toStrings(): string[];
    toShortStrings(): string[];
    toSymbols(): string[];
    toShortMDs(): string[];
}
export default CardSet;
