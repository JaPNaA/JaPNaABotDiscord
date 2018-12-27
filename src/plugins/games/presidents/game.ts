import PlayerHandler from "./playerHandler";
import BotHooks from "../../../main/bot/botHooks";
import Dealer from "./dealer";
import Games from "../../games";
import Game from "../game";

class PresidentsGame extends Game {
    parentGame: Games;

    playerHandler: PlayerHandler;
    dealer: Dealer;

    constructor(botHooks: BotHooks, parentGame: Games) {
        super(botHooks, parentGame);

        this.parentGame = parentGame;

        this.playerHandler = new PlayerHandler(this.bot, this.parentGame, this);
        this.dealer = new Dealer();
    }

    start() {
        this.dealer.distributeCards(this.playerHandler.players);
        this.startMainLoop();
    }

    private async startMainLoop() {
        this.sendEveryoneTheirDecks();
    }

    private sendEveryoneTheirDecks() {
        for (let player of this.playerHandler.players) {
            player.sendCards();
        }
    }

    _start() {
        // do nothing
    }
    _stop() {
        // do nothing
    }
}

export default PresidentsGame;