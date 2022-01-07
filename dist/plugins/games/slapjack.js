"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deck_1 = __importDefault(require("./cards/deck"));
const game_1 = __importDefault(require("../games/game"));
const toOne_1 = __importDefault(require("../../main/utils/toOne"));
const cardUtils_1 = require("./cards/cardUtils");
const mention_1 = __importDefault(require("../../main/utils/str/mention"));
class SlapJack extends game_1.default {
    _gamePluginName = "slapjack";
    _pluginName = "game." + this._gamePluginName;
    gameName = "Slap Jack";
    channelId;
    activeMessage;
    speedMilli = 1333;
    timeoutId;
    deck;
    jack = cardUtils_1.Rank.jack;
    acceptingSlaps;
    jackedTime;
    gameEnded = false;
    constructor(botHooks, parentPlugin, channelId) {
        super(botHooks, parentPlugin);
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
        this.bot.client.send(this.channelId, "Loading...")
            .then(e => {
            this.activeMessage = (0, toOne_1.default)(e);
            this.onReadyStart();
        });
    }
    onReadyStart() {
        this.bot.client.send(this.channelId, "Type `" + this.parentPlugin.precommand.names[0] +
            "slap` when the card above is a Jack");
        this.startTicking();
    }
    slap(event) {
        if (this.acceptingSlaps) {
            this.bot.client.send(event.channelId, (0, mention_1.default)(event.userId) + " did it! yay\n" +
                (event.createdTimestamp - this.jackedTime).toString() + "ms");
            this.gameEnded = true;
        }
        else {
            this.bot.client.send(event.channelId, "you slapped too early! violent!!");
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
        this.stopTicking();
    }
}
exports.default = SlapJack;
