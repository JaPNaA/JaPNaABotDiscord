import PlayerHandler from "./playerHandler";
import BotHooks from "../../../main/bot/botHooks";
import Dealer from "./dealer";
import Games from "../../games";
import MessageHandler from "./messageHandler";
import Player from "./player/player";
import PresidentsGame from "./presidents";
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
        this.tellEveryoneTheirDecksAndInstructions();
        await this.sendPile();

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

    private tellEveryoneTheirDecksAndInstructions() {
        for (let player of this.playerHandler.players) {
            let str = "";
            let precommand = this.parentGame.precommand.names[0];

            str += "**This is your deck:**\n" + player.createCardStr() + "\n";
            str += "\n**When your turn comes around:**\n";
            str += "_To play a card_, type `" + precommand + "use [cardName] [amount, if required]`\n";
            str += "_To pass_, type `" + precommand + "pass`\n";
            str += "\nGood luck!";

            this.bot.sendDM(player.userId, str);
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

            player.action.beforeTurn();

            if (this.logic.wasBurned && !this.logic.pileEmpty) {
                player.tell("Burned! It's your turn!");
            } else {
                const topSet = this.logic.pile.getTopSet();
                if (topSet) {
                    let topSetStr = " You're playing on" + topSet.toShortMDs().join("");
                    player.tell("It's your turn!" + topSetStr);
                } else {
                    player.tell("It's your turn!");
                }
            }

            this.updatePile();
            await this.waitForValidTurn(player);
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
            let msg: string = "Current pile: ";

            if (topSet) {
                msg += topSet.toShortMDs().join("");

                if (this.logic.wasBurned) {
                    msg += " _(burned)_";
                }
            } else {
                msg += "_No cards_";
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