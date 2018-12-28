import Pile from "../cards/pile";
import CardSet from "../cards/cardSet";
import { NormalCard, JokerCard, Card } from "../cards/card";
import { MessageActionError } from "./errors";
import cardHierarchy from "./cardHierarchy";
import { Rank } from "../cards/cardUtils";
import Player from "./player/player";
import Logger from "../../../main/logger";

/**
 * contains the logic for the game -
 * burning, runs, which cards can be played
 */
class Logic {
    pile: Pile;
    pileEmpty: boolean;

    wasBurned: boolean;
    lastPlayerToPlay: Player | null;
    lastPass: boolean;

    private nowBurned: boolean;

    config = {
        burnCardRank: Rank.n2,
        // How to determine first player - via card [Card] or prez [false]
        firstPlayer: false, // TODO: implement

        quickClear: true, // TODO: implement false - allow use of burning twice in a row
        vices: false, // TODO: implement true - super bum, vice bum, vice prez., prez.
        burnEnd: true, // TODO: implement false - allow last card to be a burn card
        revolutions: false // TODO: implement true - when 4x a card is played, card hierarchy reverses
    };

    constructor() {
        this.pile = new Pile();

        this.wasBurned = true;
        this.nowBurned = false;
        this.pileEmpty = true;
        this.lastPlayerToPlay = null;
        this.lastPass = false;
    }

    public getTopSetSize(): number {
        if (this.wasBurned) return 0;

        let topSet = this.pile.getTopSet();
        if (!topSet) return 0;

        return topSet.size;
    }

    public playerPass(player: Player) { 
        this.lastPass = true;
    }
    
    public playerUse(player: Player, cards: CardSet): void {
        this.nowBurned = false;
        
        this.checkForNoOneCanGoBurn(player);
        this.assertCorrect(cards);
        this.checkForBurn(cards);
        this.pile.add(cards);
        
        this.lastPlayerToPlay = player;
        this.pileEmpty = false;
        this.lastPass = false;
        this.wasBurned = this.nowBurned;
    }
    
    private checkForNoOneCanGoBurn(player: Player) {
        if (!this.lastPass) { return; }
        Logger.log(this.lastPlayerToPlay);
        if (player === this.lastPlayerToPlay) {
            this.wasBurned = true;
            this.lastPlayerToPlay = null;
            Logger.log("Passed - no one else can go");
        }
    }
    private assertCorrect(cards: CardSet) {
        this.assertCardsAreSameRank(cards);
        this.assertAmount(cards);
        this.assertHigherOrSameRank(cards);
    }

    private assertCardsAreSameRank(cards: CardSet) {
        let firstCard = cards.get(0);

        if (firstCard instanceof NormalCard) {
            this.assertCardsAreSameRank_normal(cards);
        } else {
            this.assertCardsAreSameRank_joker(cards);
        }
    }

    private assertCardsAreSameRank_joker(cards: CardSet) {
        for (let card of cards) {
            if (!card.isJoker()) {
                throw new Error("Error - not all cards in set are the same.");
            }
        }
    }

    private assertCardsAreSameRank_normal(cards: CardSet) {
        let firstCard = cards.get(0) as NormalCard;
        let size = cards.size;
        for (let i = 0; i < size; i++) {
            const card = cards.get(i);
            if (!card.isRank(firstCard.rank)) {
                throw new Error("Error - not all cards in the set are the same");
            }
        }
    }

    private assertAmount(cards: CardSet) {
        if (this.wasBurned) { return; }

        let firstCard = cards.get(0);
        if (firstCard.isRank(this.config.burnCardRank)) {
            this.assertAmount_2(cards);
            return;
        }

        if (firstCard.isJoker()) {
            if (cards.size !== 1) {
                throw new MessageActionError(
                    "You can only play 1 joker at a time."
                );
            }
            return;
        }

        let topSet = this.pile.getTopSet();
        if (!topSet) { throw new Error("Unknown Error"); }

        if (cards.size !== topSet.size) {
            throw new MessageActionError(
                "You must play " + topSet.size + " cards of the same rank."
            );
        }
    }

    private assertAmount_2(cards: CardSet) {
        let topSet = this.pile.getTopSet();
        if (!topSet) { throw new Error("Unknown Error"); }

        let required2s = Math.ceil(topSet.size / 2);
        if (cards.size !== required2s) {
            throw new MessageActionError(
                "You must play " + topSet.size + " of those cards to burn."
            );
        }
    }

    private assertHigherOrSameRank(cards: CardSet) {
        if (this.wasBurned) { return; }
        let topCard = this.pile.getTopCard() as NormalCard;
        if (!topCard) { throw new Error("Unknown Error"); }

        let firstCard = cards.get(0) as NormalCard;
        if (this.areBurnCards(cards)) { return; }

        let indexNew = cardHierarchy.indexOf(firstCard.rank);
        let indexOld = cardHierarchy.indexOf(topCard.rank);

        if (indexNew < indexOld) {
            throw new MessageActionError(
                "You must play a rank higher than of " + topCard.toShortMD()
            );
        }
    }

    private checkForBurn(cards: CardSet) {
        this.checkForBurnCards(cards);
        this.checkForSameCards(cards);
    }

    private checkForBurnCards(cards: CardSet) {
        if (this.areBurnCards(cards)) {
            this.burn();
        }
    }

    private checkForSameCards(cards: CardSet) {
        if (this.wasBurned) { return; }
        let topCard = this.pile.getTopCard() as NormalCard;
        if (!topCard) { throw new Error("Unknown Error"); }

        let firstCard = cards.get(0) as NormalCard;
        if (this.areBurnCards(cards)) { return; }

        if (firstCard.isRank(topCard.rank)) {
            this.burn();
        }
    }

    private areBurnCards(cards: CardSet): boolean {
        let firstCard = cards.get(0);
        return (
            firstCard instanceof JokerCard ||
            firstCard.isRank(this.config.burnCardRank)
        );
    }

    private burn() {
        this.nowBurned = true;
    }
}

export default Logic;