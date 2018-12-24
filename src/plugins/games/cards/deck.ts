import { Suit, Rank, SuitKeys, RankKeys } from "./cardUtils";
import { Card, NormalCard, JokerCard } from "./card";
import Pile from "./pile";

interface Options {
    /** How many decks */
    muliplier?: number;
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
};

interface AllOptions extends Options {
    muliplier: number;
    excludeJokers: boolean;
    excludeKnights: boolean;
    excludeSuits: Suit[];
    excludeRanks: Rank[];
    excludeCards: Card[];
}

const defaultOptions: AllOptions = {
    muliplier: 1,
    excludeJokers: false,
    excludeKnights: true,
    excludeSuits: [],
    excludeRanks: [],
    excludeCards: []
};

function applyDefaultOptions(options?: Options): AllOptions {
    let newOptions: AllOptions = {
        muliplier: defaultOptions.muliplier,
        excludeJokers: defaultOptions.excludeJokers,
        excludeKnights: defaultOptions.excludeKnights,
        excludeSuits: defaultOptions.excludeSuits,
        excludeRanks: defaultOptions.excludeRanks,
        excludeCards: defaultOptions.excludeCards
    };

    if (!options) {
        return newOptions;
    }

    for (let i in options) {
        if (options[i] !== undefined) {
            newOptions[i] = options[i];
        }
    }

    return newOptions;
}


class Deck extends Pile {
    options: AllOptions;

    constructor(options?: Options) {
        super();
        this.options = applyDefaultOptions(options);
        this.createDeck();
    }

    private createDeck() {
        this.addNormalCards();
        this.addJokersIfNotExcluded();
    }

    private addNormalCards() {
        for (let suit of SuitKeys) {
            if (this.options.excludeSuits.includes(suit)) {
                continue;
            }

            for (let rank of RankKeys) {
                if (
                    this.options.excludeRanks.includes(rank) || 
                    (
                        (rank == Rank.knight) && this.options.excludeKnights
                    )
                ) {
                    continue;
                }

                this.addCardIfNotExcluded(suit, rank);
            }
        }
    }

    private addCardIfNotExcluded(suit: Suit, rank: Rank) {
        let card = new NormalCard(suit, rank);

        if (
            !this.options.excludeCards.find (
                e => card.is(e)
            )
        ) {
            this.addCard(card);
        }
    }

    private addCard(card: NormalCard) {
        this.cards.push(card);
    }

    private addJokersIfNotExcluded() {
        if (this.options.excludeJokers) return;
        for (let i = 0; i < 2; i++) {
            this.addJoker();
        }
    }

    private addJoker() {
        let card = new JokerCard();
        this.cards.push(card);
    }
}

export default Deck;