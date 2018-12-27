import Deck from "../cards/deck";
import Player from "./player";
declare class Dealer {
    deck: Deck;
    config: {
        maxCards: number;
    };
    constructor();
    distributeCards(players: Player[]): void;
}
export default Dealer;
