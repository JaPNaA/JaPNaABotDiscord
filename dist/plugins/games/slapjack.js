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
    constructor(botHooks, parentPlugin, channelId) {
        super(botHooks, parentPlugin);
        this._gamePluginName = "slapjack";
        this._pluginName = "game." + this._gamePluginName;
        this.gameName = "Slap Jack";
        this.speedMilli = 1333;
        this.jack = cardUtils_1.Rank.jack;
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
            this.activeMessage = toOne_1.default(e);
            this.onReadyStart();
        });
    }
    onReadyStart() {
        this.bot.send(this.channelId, "Type `" + this.parentPlugin.precommand.names[0] +
            "slap` when the card above is a Jack");
        this.startTicking();
    }
    slap(bot, event, args) {
        if (this.acceptingSlaps) {
            bot.send(event.channelId, mention_1.default(event.userId) + " did it! yay\n" +
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
        this.stopTicking();
    }
}
exports.default = SlapJack;