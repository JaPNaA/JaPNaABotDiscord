import { Rank } from "../../cards/cardUtils";
import Player from "./player";
import Logic from "../logic";
import CardSet from "../../cards/cardSet";
declare class PlayerAction {
    player: Player;
    logic: Logic;
    constructor(player: Player, gameLogic: Logic);
    useJoker(): void;
    useCards(rank: Rank, amount: number): void;
    createSet(rank: Rank, amount: number): CardSet;
}
export default PlayerAction;
