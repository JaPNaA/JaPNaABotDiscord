import Pile from "../utils/cards/pile";
import CardSet from "../utils/cards/cardSet";
import { Rank } from "../utils/cards/cardUtils";
import Player from "./player/player";
/**
 * contains the logic for the game -
 * burning, runs, which cards can be played
 */
declare class Logic {
    pile: Pile;
    pileEmpty: boolean;
    wasBurned: boolean;
    lastPlayerToPlay: Player | null;
    lastPass: boolean;
    private nowBurned;
    config: {
        burnCardRank: Rank;
        firstPlayer: boolean;
        quickClear: boolean;
        vices: boolean;
        burnEnd: boolean;
        revolutions: boolean;
    };
    constructor();
    getRequiredAmountNormalCard(rank: Rank): number;
    getRequiredAmount(): number;
    getRequiredAmount_2(): number;
    getRequiredAmount_joker(): 1;
    getTopSetSize(): number;
    beforePlayerTurn(player: Player): void;
    playerPass(player: Player): void;
    private checkForNoOneCanGoBurn;
    playerUse(player: Player, cards: CardSet): void;
    private assertCorrect;
    private assertCardsAreSameRank;
    private assertCardsAreSameRank_joker;
    private assertCardsAreSameRank_normal;
    private assertAmount;
    private assertAmount_joker;
    private assertAmount_2;
    private assertHigherOrSameRank;
    private checkForBurn;
    private checkForBurnCards;
    private checkForSameCards;
    private areBurnCards;
    private burn;
}
export default Logic;
