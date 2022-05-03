import { Card } from "./card";
import CardList from "./cardList";

class CardSet extends CardList {
    constructor(cards: Card[]) {
        super(cards);
    }

    toStrings(): string[] {
        return this.cards.map(card => card.toString());
    }

    toShortStrings(): string[] {
        return this.cards.map(card => card.toShortString());
    }

    toSymbols(): string[] {
        return this.cards.map(card => card.toSymbol());
    }

    toShortMDs(): string[] {
        return this.cards.map(card => card.toShortMD());
    }
}

export default CardSet;