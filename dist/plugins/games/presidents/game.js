"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const playerHandler_1 = __importDefault(require("./playerHandler"));
const dealer_1 = __importDefault(require("./dealer"));
const messageHandler_1 = __importDefault(require("./messageHandler"));
const messageParser_1 = __importDefault(require("./messageParser"));
const errors_1 = require("./errors");
const logic_1 = __importDefault(require("./logic"));
const toOne_1 = __importDefault(require("../../../main/utils/toOne"));
const messageType_1 = __importDefault(require("./messageType"));
class PresidentsMain {
    bot;
    parentGame;
    presidentsGame;
    playerHandler;
    messageHandler;
    messageParser;
    logic;
    dealer;
    pileMessage;
    constructor(botHooks, parentGame, presidentsGame) {
        this.bot = botHooks;
        this.parentGame = parentGame;
        this.presidentsGame = presidentsGame;
        this.playerHandler = new playerHandler_1.default(this.bot, this.parentGame, presidentsGame);
        this.messageHandler = new messageHandler_1.default(this);
        this.messageParser = new messageParser_1.default(this);
        this.logic = new logic_1.default();
        this.dealer = new dealer_1.default();
    }
    start() {
        this.startMainLoop();
    }
    async startMainLoop() {
        this.dealer.distributeCards(this.playerHandler.players);
        this.sortEveryonesDecks();
        this.tellEveryoneTheirDecksAndInstructions();
        await this.sendPile();
        while (await this.mainLoopTick()) { }
    }
    async waitForValidTurn(player) {
        while (true) {
            try {
                await this.waitForTurn(player);
                break;
            }
            catch (err) {
                this.handlePlayerTurnError(err, player);
            }
        }
    }
    async waitForTurn(player) {
        if (player.done) {
            return;
        }
        let promise = new Promise(function (resolve) {
            player.waitForOneMessage(resolve);
        });
        let message = await promise;
        if (message.type == messageType_1.default.pass) {
            this.messageParser.parse_pass(player, message.message);
        }
        else if (message.type == messageType_1.default.use) {
            this.messageParser.parse_use(player, message.message);
        }
    }
    handlePlayerTurnError(error, player) {
        if (error instanceof errors_1.MessageSyntaxError) {
            player.tell(error.message);
        }
        else if (error instanceof errors_1.MessageActionError) {
            player.tell(error.message);
        }
    }
    sortEveryonesDecks() {
        for (let player of this.playerHandler.players) {
            player.cards.sort();
        }
    }
    tellEveryoneTheirDecksAndInstructions() {
        for (let player of this.playerHandler.players) {
            let str = "";
            let precommand = this.parentGame.precommand.names[0];
            str += "**This is your deck:**\n" + player.createCardStr() + "\n";
            str += "\n**When your turn comes around:**\n";
            str += "_To play a card_, type `" + precommand + "use [cardName] [amount, optional]`\n";
            str += "_To pass_, type `" + precommand + "pass`\n";
            str += "\nGood luck!";
            this.bot.client.sendDM(player.userId, str);
        }
    }
    async sendPile() {
        const message = (0, toOne_1.default)(await this.announce("Loading..."));
        this.pileMessage = message;
        this.updatePile();
    }
    updatePile() {
        if (this.pileMessage) {
            const topSet = this.logic.pile.getTopSet();
            let msg = "Current pile: ";
            if (topSet) {
                msg += topSet.toShortMDs().join("");
                if (this.logic.wasBurned) {
                    msg += " _(burned)_";
                }
            }
            else {
                msg += "_No cards_";
            }
            this.pileMessage.edit(msg);
        }
        else {
            this.sendPile();
        }
    }
    async mainLoopTick() {
        if (this.playerHandler.players.length <= 0) {
            return false;
        }
        for (let i = 0; i < this.playerHandler.players.length; i++) {
            const player = this.playerHandler.players[i];
            player.action.beforeTurn();
            this.sendPlayerCards(player);
            this.updatePile();
            await this.waitForValidTurn(player);
            player.tellCards();
            this.checkDone(player);
            if (this.hasGameEnded()) {
                return false;
            }
            if (this.logic.wasBurned) {
                i--;
                continue;
            }
        }
        return true;
    }
    sendPlayerCards(player) {
        if (player.done) {
            return;
        }
        if (this.logic.wasBurned && !this.logic.pileEmpty) {
            player.tell("Burned! It's your turn!");
        }
        else {
            const topSet = this.logic.pile.getTopSet();
            if (topSet) {
                let topSetStr = " You're playing on" + topSet.toShortMDs().join("");
                player.tell("It's your turn!" + topSetStr);
            }
            else {
                player.tell("It's your turn!");
            }
        }
    }
    checkDone(player) {
        if (player.done && !player.acknowledgedDone) {
            player.tell("You won! maybe");
        }
    }
    hasGameEnded() {
        let playersNotDone = 0;
        for (let player of this.playerHandler.players) {
            if (!player.done) {
                playersNotDone++;
            }
        }
        return playersNotDone <= 1; // last person is automatically loser
    }
    announce(message) {
        return this.bot.client.send(this.presidentsGame.channelId, message);
    }
    _start() {
        // do nothing
    }
    _stop() {
        // do nothing
    }
}
exports.default = PresidentsMain;
