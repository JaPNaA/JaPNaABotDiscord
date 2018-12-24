import { Card } from "./card";

class CardSet {
    amount: number;
    card: Card;

    constructor(amount: number, card: Card) {
        this.amount = amount;
        this.card = card;
    }
}

export default CardSet;