"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const utils_1 = require("../../../main/utils");
class PresidentsMain {
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
    startMainLoop() {
        return __awaiter(this, void 0, void 0, function* () {
            this.dealer.distributeCards(this.playerHandler.players);
            this.sortEveryonesDecks();
            this.tellEveryoneTheirDecks();
            this.sendPile();
            while (yield this.mainLoopTick()) { }
        });
    }
    waitForValidTurn(player) {
        return __awaiter(this, void 0, void 0, function* () {
            while (true) {
                try {
                    yield this.waitForTurn(player);
                    break;
                }
                catch (err) {
                    this.handlePlayerTurnError(err, player);
                }
            }
        });
    }
    waitForTurn(player) {
        return __awaiter(this, void 0, void 0, function* () {
            let promise = new Promise(function (resolve) {
                player.waitForOneMessage(resolve);
            });
            let message = yield promise;
            this.messageParser.parse(player, message);
        });
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
    tellEveryoneTheirDecks() {
        for (let player of this.playerHandler.players) {
            player.tellCards();
        }
    }
    sendPile() {
        return __awaiter(this, void 0, void 0, function* () {
            const message = utils_1.toOne(yield this.announce("Loading..."));
            this.pileMessage = message;
            this.updatePile();
        });
    }
    mainLoopTick() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.playerHandler.players.length <= 0) {
                return false;
            }
            for (let player of this.playerHandler.players) {
                player.tell("It's your turn!");
                yield this.waitForValidTurn(player);
                this.updatePile();
                player.tellCards();
            }
            return true;
        });
    }
    updatePile() {
        if (this.pileMessage) {
            const topSet = this.logic.pile.getTopSet();
            let msg;
            if (topSet) {
                msg = topSet.toShortMDs().join("");
            }
            else {
                msg = "_No cards_";
            }
            if (this.logic.wasBurned) {
                msg += " _(burned)_";
            }
            this.pileMessage.edit(msg);
        }
        else {
            this.sendPile();
        }
    }
    announce(message) {
        return this.bot.send(this.presidentsGame.channelId, message);
    }
    _start() {
        // do nothing
    }
    _stop() {
        // do nothing
    }
}
exports.default = PresidentsMain;
