import { Rank } from "../../utils/cards/cardUtils";
import Player from "./player";
import Logic from "../logic";
import CardSet from "../../utils/cards/cardSet";
declare class PlayerAction {
    player: Player;
    logic: Logic;
    constructor(player: Player, gameLogic: Logic);
    beforeTurn(): void;
    pass(): void;
    useJoker(): void;
    useCards(rank: Rank, amount: number): void;
    createJokerSet(): CardSet;
    createSet(rank: Rank, amount: number): CardSet;
}
export default PlayerAction;
