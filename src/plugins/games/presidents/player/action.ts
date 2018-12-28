import { Rank } from "../../cards/cardUtils";
import Player from "./player";
import { MessageSyntaxError, MessageActionError } from "../errors";
import Logic from "../logic";
import CardSet from "../../cards/cardSet";

class PlayerAction {
    player: Player;
    logic: Logic;

    constructor(player: Player, gameLogic: Logic) {
        this.player = player;
        this.logic = gameLogic;
    }

    beforeTurn() {
        this.logic.beforePlayerTurn(this.player);
    }

    pass() {
        this.logic.playerPass(this.player);
    }

    useJoker() {
        const set = this.createJokerSet();
        this.logic.playerUse(this.player, set);
        this.player.cards.removeCards(set);
    }

    useCards(rank: Rank, amount: number) {
        if (isNaN(amount) || amount <= 0) {
            throw new MessageSyntaxError("Amount is invalid");
        }

        const set = this.createSet(rank, amount);
        this.logic.playerUse(this.player, set);
        this.player.cards.removeCards(set);
    }

    createJokerSet(): CardSet {
        const joker = this.player.cards.getJoker();
        if (!joker) {
            throw new MessageActionError("You do not have a joker.");
        }
        return new CardSet([joker]);
    }

    createSet(rank: Rank, amount: number): CardSet {
        const cards = this.player.cards.getRank(rank, amount);
        if (cards.length < amount) {
            throw new MessageActionError("You do not have enough cards.");
        }
        const set = new CardSet(cards);
        return set;
    }
}

export default PlayerAction;