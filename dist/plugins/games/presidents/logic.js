"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pile_1 = __importDefault(require("../cards/pile"));
const card_1 = require("../cards/card");
const errors_1 = require("./errors");
const cardHierarchy_1 = __importDefault(require("./cardHierarchy"));
const cardUtils_1 = require("../cards/cardUtils");
/**
 * contains the logic for the game -
 * burning, runs, which cards can be played
 */
class Logic {
    constructor() {
        this.config = {
            burnCardRank: cardUtils_1.Rank.n2,
            // How to determine first player - via card [Card] or prez [false]
            firstPlayer: false,
            quickClear: true,
            vices: false,
            burnEnd: true,
            revolutions: false // TODO: implement true - when 4x a card is played, card hierarchy reverses
        };
        this.pile = new pile_1.default();
        this.burned = true;
    }
    getTopSetSize() {
        if (this.burned)
            return 0;
        let topSet = this.pile.getTopSet();
        if (!topSet)
            return 0;
        return topSet.size;
    }
    playerUse(cards) {
        // puts cards down, burn them, etc
        // throw errors!
        this.assertCorrect(cards);
        this.checkForBurn(cards);
        this.pile.add(cards);
    }
    assertCorrect(cards) {
        this.assertCardsAreSameRank(cards);
        this.assertAmount(cards);
        this.assertHigherOrSameRank(cards);
    }
    assertCardsAreSameRank(cards) {
        let firstCard = cards.get(0);
        if (firstCard instanceof card_1.NormalCard) {
            this.assertCardsAreSameRank_normal(cards);
        }
        else {
            this.assertCardsAreSameRank_joker(cards);
        }
    }
    assertCardsAreSameRank_joker(cards) {
        for (let card of cards) {
            if (!card.isJoker()) {
                throw new Error("Error - not all cards in set are the same.");
            }
        }
    }
    assertCardsAreSameRank_normal(cards) {
        let firstCard = cards.get(0);
        let size = cards.size;
        for (let i = 0; i < size; i++) {
            const card = cards.get(i);
            if (!card.isRank(firstCard.rank)) {
                throw new Error("Error - not all cards in the set are the same");
            }
        }
    }
    assertAmount(cards) {
        if (this.burned) {
            return;
        }
        let firstCard = cards.get(0);
        if (firstCard.isRank(this.config.burnCardRank)) {
            this.assertAmount_2(cards);
            return;
        }
        let topSet = this.pile.getTopSet();
        if (!topSet) {
            throw new Error("Unknown Error");
        }
        if (cards.size !== topSet.size) {
            throw new errors_1.MessageActionError("You must play " + topSet.size + " cards of the same rank.");
        }
    }
    assertAmount_2(cards) {
        let topSet = this.pile.getTopSet();
        if (!topSet) {
            throw new Error("Unknown Error");
        }
        let required2s = Math.ceil(topSet.size / 2);
        if (cards.size !== required2s) {
            throw new errors_1.MessageActionError("You must play " + topSet.size + " of those cards to burn.");
        }
    }
    assertHigherOrSameRank(cards) {
        if (this.burned) {
            return;
        }
        let topCard = this.pile.getTopCard();
        if (!topCard) {
            throw new Error("Unknown Error");
        }
        let firstCard = cards.get(0);
        if (this.areBurnCards(cards)) {
            return;
        }
        let indexNew = cardHierarchy_1.default.indexOf(firstCard.rank);
        let indexOld = cardHierarchy_1.default.indexOf(topCard.rank);
        if (indexNew < indexOld) {
            throw new errors_1.MessageActionError("You must play a rank higher than of " + topCard.toShortMD());
        }
    }
    checkForBurn(cards) {
        this.checkForBurnCards(cards);
        this.checkForSameCards(cards);
    }
    checkForBurnCards(cards) {
        if (this.areBurnCards(cards)) {
            this.burn();
        }
    }
    checkForSameCards(cards) {
        if (this.burned) {
            return;
        }
        let topCard = this.pile.getTopCard();
        if (!topCard) {
            throw new Error("Unknown Error");
        }
        let firstCard = cards.get(0);
        if (this.areBurnCards(cards)) {
            return;
        }
        if (firstCard.is(topCard)) {
            this.burn();
        }
    }
    areBurnCards(cards) {
        let firstCard = cards.get(0);
        return (firstCard instanceof card_1.JokerCard ||
            firstCard.isRank(this.config.burnCardRank));
    }
    burn() {
        this.burned = true;
    }
}
exports.default = Logic;
