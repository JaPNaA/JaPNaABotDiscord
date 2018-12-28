"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cards_1 = __importDefault(require("./cards"));
const action_1 = __importDefault(require("./action"));
class Player {
    constructor(botHooks, presidentGame, userId) {
        this.bot = botHooks;
        this.userId = userId;
        this.cards = new cards_1.default();
        this.action = new action_1.default(this, presidentGame.logic);
        this.messageCallbacks = [];
    }
    tell(message) {
        this.bot.sendDM(this.userId, message);
    }
    tellCards() {
        let cardStr = "";
        for (let card of this.cards.cards) {
            cardStr += card.toShortMD();
        }
        this.bot.sendDM(this.userId, cardStr);
    }
    waitForOneMessage(callback) {
        this.messageCallbacks.push(callback);
    }
    onMessage(message, type) {
        while (true) {
            const messageCallback = this.messageCallbacks.pop();
            if (!messageCallback)
                break;
            messageCallback({ message, type });
        }
    }
}
exports.default = Player;
