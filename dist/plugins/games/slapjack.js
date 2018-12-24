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
        this._pluginName = "game.slapjack";
        this.gameName = "Slap Jack";
        this.speedMilli = 1333;
        this.jack = cardTypes_1.Rank.jack;
        this.gameEnded = false;
        this.deck = new deck_1.default({
            excludeJokers: true
        });
        this.deck.shuffle();
        this.channelId = channelId;
        this.acceptingSlaps = false;
        this.jackedTime = 0;
    }
    _start() {
        this._registerCommand(this.commandManager, "slap", this.slap);
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
    slap(bot, event, args) {
        if (this.acceptingSlaps) {
            bot.send(event.channelId, `<@${event.userId}> did it! yay\n` +
                (event.createdTimestamp - this.jackedTime).toString() + "ms");
            this.gameEnded = true;
        }
        else {
            bot.send(event.channelId, "you slapped too early! violent!!");
        }
    }
    tick() {
        if (!this.activeMessage) {
            return;
        }
        let topCard = this.deck.takeTop();
        if (!topCard) {
            throw new Error("No cards left");
        }
        let promise = this.activeMessage.edit(topCard.toString());
        if (topCard.isRank(this.jack)) {
            this.jacked(promise);
        }
    }
    jacked(editPromise) {
        this.stopTicking();
        editPromise.then(() => {
            this.acceptingSlaps = true;
            this.jackedTime = Date.now();
        });
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
