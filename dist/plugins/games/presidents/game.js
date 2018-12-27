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
class PresidentsMain {
    constructor(botHooks, parentGame, presidentsGame) {
        this.bot = botHooks;
        this.parentGame = parentGame;
        this.playerHandler = new playerHandler_1.default(this.bot, this.parentGame, presidentsGame);
        this.messageHandler = new messageHandler_1.default(this);
        this.dealer = new dealer_1.default();
    }
    start() {
        this.startMainLoop();
    }
    startMainLoop() {
        return __awaiter(this, void 0, void 0, function* () {
            this.dealer.distributeCards(this.playerHandler.players);
            this.sortEveryonesDecks();
            this.sendEveryoneTheirDecks();
            while (true) {
                // protect against infinite loop
                if (this.playerHandler.players.length <= 0)
                    break;
                for (let player of this.playerHandler.players) {
                    yield this.waitForTurn(player);
                    player.sendCards();
                }
            }
        });
    }
    waitForTurn(player) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise(function (resolve) {
                player.waitForOneMessage(resolve);
            });
        });
    }
    sortEveryonesDecks() {
        for (let player of this.playerHandler.players) {
            player.cards.sort();
        }
    }
    sendEveryoneTheirDecks() {
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
exports.default = PresidentsMain;
