"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const game_1 = __importDefault(require("./game"));
const deck_1 = __importDefault(require("./cards/deck"));
const pile_1 = __importDefault(require("./cards/pile"));
const specialUtils_1 = require("../../main/specialUtils");
class Player {
    constructor(userId) {
        this.userId = userId;
        this.cards = new pile_1.default();
    }
}
class Logic {
    constructor(playerIds) {
        this.players = [];
        this.deck = new deck_1.default();
        this.pile = new pile_1.default();
        this.topSet = null;
        this.init(playerIds);
    }
    init(playerIds) {
        this.deck.shuffle();
        this.initPlayers(playerIds);
    }
    initPlayers(playerIds) {
        for (let playerId of playerIds) {
            this.players.push(new Player(playerId));
        }
    }
    distributeCards() {
        let numPlayers = this.players.length;
        let numCards = this.deck.cards.length;
        let cardsPerPlayer = Math.floor(numCards / numPlayers);
        for (let player of this.players) {
            for (let i = 0; i < cardsPerPlayer; i++) {
                let card = this.deck.takeTop();
                if (!card) {
                    throw new Error("Unknown Error");
                }
                player.cards.add(card);
            }
            player.cards.sortByRank();
        }
    }
}
class Presidents extends game_1.default {
    constructor(botHooks, parentPlugin, channelId) {
        super(botHooks, parentPlugin);
        this._gamePluginName = "presidents";
        this._pluginName = "game." + this._gamePluginName;
        this.gameName = "Presidents";
        this.channelId = channelId;
        this.playerIds = [];
        this.started = false;
    }
    join(bot, event, args) {
        let userId = event.userId;
        this.playerIds.push(userId);
        bot.send(event.channelId, specialUtils_1.mention(userId) + ` has joined ${this.gameName}!`);
    }
    leave(bot, event, args) {
        let userId = event.userId;
        let index = this.playerIds.indexOf(userId);
        this.playerIds.splice(index, 1);
        if (index < 0) {
            bot.send(event.channelId, specialUtils_1.mention(userId) + ", you were never in the game!");
        }
        else {
            bot.send(event.channelId, specialUtils_1.mention(userId) + " has left the game");
        }
    }
    start(bot, event, args) {
        this.started = true;
        this._sendStartingMessage();
        this._startGameLogic();
    }
    listPlayers(bot, event, args) {
        let numPlayers = this.playerIds.length;
        if (numPlayers === 0) {
            bot.send(event.channelId, "No one is in this game.");
        }
        else if (numPlayers === 1) {
            bot.send(event.channelId, "Just " + specialUtils_1.mention(this.playerIds[0]) + ", the Loner.");
        }
        else {
            bot.send(event.channelId, this.playerIds.map(e => specialUtils_1.mention(e)).join(", ") + " (" + this.playerIds.length + " players)");
        }
    }
    _sendStartingMessage() {
        let players = [];
        for (let playerId of this.playerIds) {
            players.push(specialUtils_1.mention(playerId));
        }
        this.bot.send(this.channelId, "Starting Presidents with players:\n" + players.join(", "));
    }
    _startGameLogic() {
        this.logic = new Logic(this.playerIds);
    }
    _start() {
        this._registerCommand(this.commandManager, "join", this.join);
        this._registerCommand(this.commandManager, "leave", this.leave);
        this._registerCommand(this.commandManager, "start", this.start);
        this._registerCommand(this.commandManager, "players", this.listPlayers);
        this._sendAboutMessage();
    }
    _sendAboutMessage() {
        const fields = [];
        const precommmand = this.parentPlugin.precommand.names[0];
        fields.push({
            name: "Commands",
            value: "**Joining**\n" +
                "Join this game by typing `" + precommmand + "join`\n" +
                "and you can leave by typing `" + precommmand + "leave`.\n" +
                "You can list all the players with `" + precommmand + "players`" +
                "There can be ### players.\n" +
                "**Starting**\n" +
                "Once all the players are in, type `" + precommmand + "start` to start the game"
        });
        this.bot.send(this.channelId, {
            embed: {
                color: this.bot.config.themeColor,
                title: this.gameName,
                description: "The ultimate social card game.",
                fields: fields
            }
        });
    }
    _stop() {
        // do nothing
    }
}
exports.default = Presidents;
