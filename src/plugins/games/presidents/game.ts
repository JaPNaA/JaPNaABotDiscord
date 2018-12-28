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
import { Message } from "discord.js";
import { toOne } from "../../../main/utils";
import MessageEvent from "./messageEvent";
import MessageType from "./messageType";

class PresidentsMain {
    bot: BotHooks;
    parentGame: Games;
    presidentsGame: PresidentsGame;

    playerHandler: PlayerHandler;
    messageHandler: MessageHandler;
    messageParser: MessageParser;
    logic: Logic;
    dealer: Dealer;

    pileMessage?: Message;

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
        this.sendPile();

        while (await this.mainLoopTick()) { }
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
        let promise: Promise<MessageEvent> = new Promise(function (resolve) {
            player.waitForOneMessage(resolve);
        });

        let message = await promise;

        if (message.type == MessageType.pass) {
            this.messageParser.parse_pass(player, message.message);
        } else if (message.type == MessageType.use) {
            this.messageParser.parse_use(player, message.message);
        }
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

    private async sendPile() {
        const message = toOne(await this.announce("Loading..."));
        this.pileMessage = message;
        this.updatePile();
    }

    async mainLoopTick(): Promise<boolean> {
        if (this.playerHandler.players.length <= 0) {
            return false;
        }

        for (let i = 0; i < this.playerHandler.players.length; i++) {
            const player = this.playerHandler.players[i];

            if (this.logic.wasBurned && !this.logic.pileEmpty) {
                player.tell("Burned! It's your turn!");
            } else {
                player.tell("It's your turn!");
            }

            await this.waitForValidTurn(player);

            this.updatePile();
            player.tellCards();

            if (this.logic.wasBurned) {
                i--;
                continue;
            }
        }

        return true;
    }

    private updatePile() {
        if (this.pileMessage) {
            const topSet = this.logic.pile.getTopSet();
            let msg: string;

            if (topSet) {
                msg = topSet.toShortMDs().join("");

                if (this.logic.wasBurned) {
                    msg += " _(burned)_";
                }
            } else {
                msg = "_No cards_";
            }


            this.pileMessage.edit(msg);
        } else {
            this.sendPile();
        }
    }

    private announce(message: string): Promise<Message | Message[]> {
        return this.bot.send(this.presidentsGame.channelId, message);
    }

    _start() {
        // do nothing
    }
    _stop() {
        // do nothing
    }
}

export default PresidentsMain;