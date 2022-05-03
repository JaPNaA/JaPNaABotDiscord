import { Suit, Rank } from "./cardUtils";
import { Card } from "./card";
import CardsList from "./pile";
interface Options {
    /** How many decks */
    muliplier?: number;
    /** Automatically shuffle? */
    shuffled?: boolean;
    /** Don't put jokers in deck */
    excludeJokers?: boolean;
    /** Exclude knights in deck */
    excludeKnights?: boolean;
    /** Suits not to put in deck */
    excludeSuits?: Suit[];
    /** Ranks not to put in deck */
    excludeRanks?: Rank[];
    /** Specific cards not to put in deck */
    excludeCards?: Card[];
    [x: string]: any;
}
interface AllOptions extends Options {
    muliplier: number;
    shuffled: boolean;
    excludeJokers: boolean;
    excludeKnights: boolean;
    excludeSuits: Suit[];
    excludeRanks: Rank[];
    excludeCards: Card[];
}
declare class Deck extends CardsList {
    options: AllOptions;
    constructor(options?: Options);
    private createDeck;
    private addNormalCards;
    private addCardIfNotExcluded;
    private addCard;
    private addJokersIfNotExcluded;
    private addJoker;
}
export default Deck;
