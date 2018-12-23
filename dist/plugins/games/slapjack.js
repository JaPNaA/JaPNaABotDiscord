"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deck_1 = __importDefault(require("./cards/deck"));
const game_1 = __importDefault(require("../games/game"));
const utils_1 = require("../../main/utils");
const cardTypes_1 = require("./cards/cardTypes");
class SlapJack extends game_1.default {
    constructor(botHooks, channelId) {
        super(botHooks);
        this.speedMilli = 1333;
        this.jack = cardTypes_1.Rank.jack;
        this.deck = new deck_1.default();
        this.deck.shuffle();
        this.channelId = channelId;
    }
    _start() {
        this.bot.send(this.channelId, "Loading...")
            .then(e => {
            this.activeMessage = utils_1.toOne(e);
            this.onReadyStart();
        });
    }
    onReadyStart() {
        this.bot.send(this.channelId, "Type `g!slap` when the card above is a Jack");
        this.tick();
        this.startTicking();
    }
    tick() {
        if (!this.activeMessage) {
            return;
        }
        let topCard = this.deck.takeTop();
        if (!topCard) {
            throw new Error("No cards left");
        }
        if (topCard.isRank(this.jack)) {
            this.stopTicking();
        }
        this.activeMessage.edit(topCard.toString());
    }
    startTicking() {
        this.timeoutId = setInterval(() => {
            this.tick();
        }, this.speedMilli);
    }
    stopTicking() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }
    _stop() {
        //
    }
}
exports.default = SlapJack;
