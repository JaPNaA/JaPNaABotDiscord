"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cardUtils_1 = require("./cardUtils");
const card_1 = require("./card");
const pile_1 = __importDefault(require("./pile"));
;
const defaultOptions = {
    muliplier: 1,
    shuffled: false,
    excludeJokers: false,
    excludeKnights: true,
    excludeSuits: [],
    excludeRanks: [],
    excludeCards: []
};
function applyDefaultOptions(options) {
    let newOptions = {
        muliplier: defaultOptions.muliplier,
        shuffled: defaultOptions.shuffled,
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
class Deck extends pile_1.default {
    options;
    constructor(options) {
        super();
        this.options = applyDefaultOptions(options);
        this.createDeck();
    }
    createDeck() {
        this.addNormalCards();
        this.addJokersIfNotExcluded();
        if (this.options.shuffled) {
            this.shuffle();
        }
    }
    addNormalCards() {
        for (let suit of cardUtils_1.SuitKeys) {
            if (this.options.excludeSuits.includes(suit)) {
                continue;
            }
            for (let rank of cardUtils_1.RankKeys) {
                if (this.options.excludeRanks.includes(rank) ||
                    ((rank == cardUtils_1.Rank.knight) && this.options.excludeKnights)) {
                    continue;
                }
                this.addCardIfNotExcluded(suit, rank);
            }
        }
    }
    addCardIfNotExcluded(suit, rank) {
        let card = new card_1.NormalCard(suit, rank);
        if (!this.options.excludeCards.find(e => card.is(e))) {
            this.addCard(card);
        }
    }
    addCard(card) {
        this.cards.push(card);
    }
    addJokersIfNotExcluded() {
        if (this.options.excludeJokers)
            return;
        for (let i = 0; i < 2; i++) {
            this.addJoker();
        }
    }
    addJoker() {
        let card = new card_1.JokerCard();
        this.cards.push(card);
    }
}
exports.default = Deck;
