import PlayerHandler from "./playerHandler";
import BotHooks from "../../../main/bot/botHooks";
import Dealer from "./dealer";
import Games from "../../games";
import Game from "../game";
import MessageHandler from "./messageHandler";
import Player from "./player";
import Presidents from "./presidents";

class PresidentsMain {
    bot: BotHooks;
    parentGame: Games;

    playerHandler: PlayerHandler;
    messageHandler: MessageHandler;
    dealer: Dealer;

    constructor(botHooks: BotHooks, parentGame: Games, presidentsGame: Presidents) {
        this.bot = botHooks;
        this.parentGame = parentGame;

        this.playerHandler = new PlayerHandler(this.bot, this.parentGame, presidentsGame);
        this.messageHandler = new MessageHandler(this);
        this.dealer = new Dealer();
    }

    start() {
        this.startMainLoop();
    }
    
    private async startMainLoop() {
        this.dealer.distributeCards(this.playerHandler.players);
        this.sortEveryonesDecks();
        this.sendEveryoneTheirDecks();

        while (true) {
            // protect against infinite loop
            if (this.playerHandler.players.length <= 0) break;

            for (let player of this.playerHandler.players) {
                await this.waitForTurn(player);
                player.sendCards();
            }
        }
    }

    private async waitForTurn(player: Player) {
        await new Promise(function(resolve) {
            player.waitForOneMessage(resolve);
        });
    }

    private sortEveryonesDecks() {
        for (let player of this.playerHandler.players) {
            player.cards.sort();
        }
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

export default PresidentsMain;