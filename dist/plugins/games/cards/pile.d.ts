import { Card } from "./card";
declare class Pile {
    cards: Card[];
    constructor();
    [Symbol.iterator](): Iterator<Card>;
    add(card: Card): void;
    sortByRank(): void;
    sortBySuit(): void;
    shuffle(): void;
    takeTop(): Card | undefined;
}
export default Pile;
