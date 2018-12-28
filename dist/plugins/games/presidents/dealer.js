"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deck_1 = __importDefault(require("../cards/deck"));
class Dealer {
    constructor() {
        this.config = {
            maxCards: 18
        };
        this.deck = new deck_1.default({
            shuffled: true
        });
    }
    distributeCards(players) {
        let numPlayers = players.length;
        let numCards = this.deck.cards.length;
        let cardsPerPlayer = Math.floor(numCards / numPlayers);
        if (cardsPerPlayer > this.config.maxCards) {
            cardsPerPlayer = this.config.maxCards;
        }
        for (let player of players) {
            for (let i = 0; i < cardsPerPlayer; i++) {
                let card = this.deck.takeTop();
                if (!card) {
                    throw new Error("Not enough cards");
                }
                player.cards.add(card);
            }
        }
    }
}
exports.default = Dealer;
