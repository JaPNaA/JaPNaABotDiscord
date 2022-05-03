import Deck from "../utils/cards/deck";
import Player from "./player/player";
declare class Dealer {
    deck: Deck;
    config: {
        maxCards: number;
    };
    constructor();
    distributeCards(players: Player[]): void;
}
export default Dealer;
