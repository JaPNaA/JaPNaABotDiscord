import PlayerHandler from "./playerHandler";
import BotHooks from "../../../main/bot/botHooks";
import Dealer from "./dealer";
import Games from "../../games";
import MessageHandler from "./messageHandler";
import Player from "./player/player";
import PresidentsGame from "./presidents";
import { DiscordCommandEvent } from "../../../main/events";
import MessageParser from "./messageParser";
import { MessageSyntaxError, MessageActionError } from "./errors";
import Logic from "./logic";

class PresidentsMain {
    bot: BotHooks;
    parentGame: Games;
    presidentsGame: PresidentsGame;

    playerHandler: PlayerHandler;
    messageHandler: MessageHandler;
    messageParser: MessageParser;
    logic: Logic;
    dealer: Dealer;

    constructor(botHooks: BotHooks, parentGame: Games, presidentsGame: PresidentsGame) {
        this.bot = botHooks;
        this.parentGame = parentGame;
        this.presidentsGame = presidentsGame;

        this.playerHandler = new PlayerHandler(this.bot, this.parentGame, presidentsGame);
        this.messageHandler = new MessageHandler(this);
        this.messageParser = new MessageParser(this);
        this.logic = new Logic();
        this.dealer = new Dealer();
    }

    start() {
        this.startMainLoop();
    }

    private async startMainLoop() {
        this.dealer.distributeCards(this.playerHandler.players);
        this.sortEveryonesDecks();
        this.tellEveryoneTheirDecks();

        while (true) {
            // protect against infinite loop
            if (this.playerHandler.players.length <= 0) break;

            for (let player of this.playerHandler.players) {
                player.tell("It's your turn!");
                await this.waitForValidTurn(player);
                player.tellCards();
            }
        }
    }

    private async waitForValidTurn(player: Player) {
        while (true) {
            try {
                await this.waitForTurn(player);
                break;
            } catch (err) {
                this.handlePlayerTurnError(err, player);
            }
        }
    }

    private async waitForTurn(player: Player) {
        let promise: Promise<DiscordCommandEvent> = new Promise(function (resolve) {
            player.waitForOneMessage(resolve);
        });

        let message = await promise;
        this.messageParser.parse(player, message);
    }

    private handlePlayerTurnError(error: Error, player: Player) {
        if (error instanceof MessageSyntaxError) {
            player.tell(error.message);
        } else if (error instanceof MessageActionError) {
            player.tell(error.message);
        }
    }

    private sortEveryonesDecks() {
        for (let player of this.playerHandler.players) {
            player.cards.sort();
        }
    }

    private tellEveryoneTheirDecks() {
        for (let player of this.playerHandler.players) {
            player.tellCards();
        }
    }

    private announce(message: string) {
        this.bot.send(this.presidentsGame.channelId, message);
    }

    _start() {
        // do nothing
    }
    _stop() {
        // do nothing
    }
}

export default PresidentsMain;