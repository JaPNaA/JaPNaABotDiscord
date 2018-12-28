import Pile from "../cards/pile";
import CardSet from "../cards/cardSet";
import { Rank } from "../cards/cardUtils";
/**
 * contains the logic for the game -
 * burning, runs, which cards can be played
 */
declare class Logic {
    pile: Pile;
    wasBurned: boolean;
    nowBurned: boolean;
    config: {
        burnCardRank: Rank;
        firstPlayer: boolean;
        quickClear: boolean;
        vices: boolean;
        burnEnd: boolean;
        revolutions: boolean;
    };
    constructor();
    getTopSetSize(): number;
    playerUse(cards: CardSet): void;
    private assertCorrect;
    private assertCardsAreSameRank;
    private assertCardsAreSameRank_joker;
    private assertCardsAreSameRank_normal;
    private assertAmount;
    private assertAmount_2;
    private assertHigherOrSameRank;
    private checkForBurn;
    private checkForBurnCards;
    private checkForSameCards;
    private areBurnCards;
    private burn;
}
export default Logic;
