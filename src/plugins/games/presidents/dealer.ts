import Deck from "../cards/deck";
import Player from "./player/player";

class Dealer {
    deck: Deck;

    config = {
        maxCards: 18
    };

    constructor() {
        this.deck = new Deck({
            shuffled: true
        });
    }

    distributeCards(players: Player[]) {
        let numPlayers = players.length;
        let numCards = this.deck.cards.length;
        let cardsPerPlayer = Math.floor(numCards / numPlayers);

        if (cardsPerPlayer > this.config.maxCards) {
            cardsPerPlayer = this.config.maxCards;
        }

        for (let player of players) {
            for (let i = 0; i < cardsPerPlayer; i++) {
                let card = this.deck.takeTop();
                if (!card) { throw new Error("Not enough cards"); }
                player.cards.add(card);
            }
        }
    }
}

export default Dealer;