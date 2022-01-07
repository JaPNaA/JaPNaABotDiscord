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
        this.done = false;
        this.acknowledgedDone = false;
    }
    checkDone() {
        if (this.cards.cards.size === 0) {
            this.done = true;
        }
    }
    tell(message) {
        this.bot.client.sendDM(this.userId, message);
    }
    createCardStr() {
        let cardStr = "";
        for (let card of this.cards.cards) {
            cardStr += card.toShortMD();
        }
        return cardStr;
    }
    tellCards() {
        if (this.done) {
            return;
        }
        this.bot.client.sendDM(this.userId, "**Your deck**\n" + this.createCardStr());
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
