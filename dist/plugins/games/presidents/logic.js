"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pile_1 = __importDefault(require("../utils/cards/pile"));
const card_1 = require("../utils/cards/card");
const errors_1 = require("./errors");
const cardHierarchy_1 = __importDefault(require("./cardHierarchy"));
const cardUtils_1 = require("../utils/cards/cardUtils");
/**
 * contains the logic for the game -
 * burning, runs, which cards can be played
 */
class Logic {
    pile;
    pileEmpty;
    wasBurned;
    lastPlayerToPlay;
    lastPass;
    nowBurned;
    config = {
        burnCardRank: cardUtils_1.Rank.n2,
        // How to determine first player - via card [Card] or prez [false]
        firstPlayer: false, // TODO: implement
        quickClear: true, // TODO: implement false - allow use of burning twice in a row
        vices: false, // TODO: implement true - super bum, vice bum, vice prez., prez.
        burnEnd: true, // TODO: implement false - allow last card to be a burn card
        revolutions: false // TODO: implement true - when 4x a card is played, card hierarchy reverses
    };
    constructor() {
        this.pile = new pile_1.default();
        this.wasBurned = true;
        this.nowBurned = false;
        this.pileEmpty = true;
        this.lastPlayerToPlay = null;
        this.lastPass = false;
    }
    getRequiredAmountNormalCard(rank) {
        if (rank === this.config.burnCardRank) {
            return this.getRequiredAmount_2();
        }
        else {
            return this.getRequiredAmount();
        }
    }
    getRequiredAmount() {
        const topSet = this.pile.getTopSet();
        if (!topSet) {
            return 0;
        }
        return this.getTopSetSize();
    }
    getRequiredAmount_2() {
        const topSet = this.pile.getTopSet();
        if (!topSet) {
            return 0;
        }
        return Math.ceil(topSet.size / 2);
    }
    getRequiredAmount_joker() {
        return 1;
    }
    getTopSetSize() {
        if (this.wasBurned)
            return 0;
        let topSet = this.pile.getTopSet();
        if (!topSet)
            return 0;
        return topSet.size;
    }
    beforePlayerTurn(player) {
        this.checkForNoOneCanGoBurn(player);
    }
    playerPass(player) {
        this.lastPass = true;
    }
    checkForNoOneCanGoBurn(player) {
        if (!this.lastPass) {
            return;
        }
        if (player === this.lastPlayerToPlay) {
            this.wasBurned = true;
            this.lastPlayerToPlay = null;
        }
    }
    playerUse(player, cards) {
        this.nowBurned = false;
        this.assertCorrect(cards);
        this.checkForBurn(cards);
        this.pile.add(cards);
        this.lastPlayerToPlay = player;
        this.pileEmpty = false;
        this.lastPass = false;
        this.wasBurned = this.nowBurned;
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
        if (this.wasBurned) {
            return;
        }
        let firstCard = cards.get(0);
        if (firstCard.isRank(this.config.burnCardRank)) {
            this.assertAmount_2(cards);
            return;
        }
        if (firstCard.isJoker()) {
            this.assertAmount_joker(cards);
            return;
        }
        let requiredAmount = this.getRequiredAmount();
        if (cards.size !== requiredAmount) {
            throw new errors_1.MessageActionError("You must play " + requiredAmount + " cards of the same rank.");
        }
    }
    assertAmount_joker(cards) {
        if (cards.size !== this.getRequiredAmount_joker()) {
            throw new errors_1.MessageActionError("You can only play 1 joker at a time.");
        }
    }
    assertAmount_2(cards) {
        const topSet = this.pile.getTopSet();
        if (!topSet) {
            throw new Error("Unknown Error");
        }
        let required2s = this.getRequiredAmount_2();
        if (cards.size !== required2s) {
            throw new errors_1.MessageActionError("You must play " + required2s + " of those cards to burn.");
        }
    }
    assertHigherOrSameRank(cards) {
        if (this.wasBurned) {
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
        if (this.wasBurned) {
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
        if (firstCard.isRank(topCard.rank)) {
            this.burn();
        }
    }
    areBurnCards(cards) {
        let firstCard = cards.get(0);
        return (firstCard instanceof card_1.JokerCard ||
            firstCard.isRank(this.config.burnCardRank));
    }
    burn() {
        this.nowBurned = true;
    }
}
exports.default = Logic;
