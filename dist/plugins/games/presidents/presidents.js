"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const game_1 = __importDefault(require("../game"));
const mention_1 = __importDefault(require("../../../main/utils/str/mention"));
const game_2 = __importDefault(require("./game"));
const errors_1 = require("./errors");
const messageType_1 = __importDefault(require("./messageType"));
/**
 * Handles leaving and joining of Presidents, as long as some aliases to other
 * components
 */
class Presidents extends game_1.default {
    constructor(botHooks, parentPlugin, channelId, initer) {
        super(botHooks, parentPlugin);
        this._gamePluginName = "presidents";
        this._pluginName = "game." + this._gamePluginName;
        this.gameName = "Presidents";
        this.gameName = "Presidents";
        this._gamePluginName = "presidents";
        this._pluginName = "game." + this._gamePluginName;
        this.initer = initer;
        this.channelId = channelId;
        this.game = new game_2.default(this.bot, this.parentPlugin, this);
    }
    join(bot, event, args) {
        let userId = event.userId;
        this.addPlayer(userId);
    }
    silentlyAddPlayer(userId) {
        try {
            this.game.playerHandler.addPlayer(userId);
        }
        catch (err) {
            this.handleJoinError(err, userId);
        }
    }
    addPlayer(userId) {
        try {
            this.game.playerHandler.addPlayer(userId);
            this.bot.send(this.channelId, mention_1.default(userId) + " has joined " + this.gameName + "!");
        }
        catch (err) {
            this.handleJoinError(err, userId);
        }
    }
    handleJoinError(err, userId) {
        if (err instanceof errors_1.AlreadyJoinedError) {
            this.bot.send(this.channelId, mention_1.default(userId) + ", you're already in the game!");
        }
        else if (err instanceof errors_1.DMAlreadyLockedError) {
            this.bot.send(this.channelId, "Failed to add " + mention_1.default(userId) +
                ". You're in another game which also requires DMs!");
        }
    }
    leave(bot, event, args) {
        let userId = event.userId;
        let result = this.game.playerHandler.removePlayer(userId);
        if (result) {
            bot.send(event.channelId, mention_1.default(userId) + " has left the game");
        }
        else {
            bot.send(event.channelId, mention_1.default(userId) + ", you were never in the game!");
        }
    }
    start(bot, event, args) {
        this._sendStartingMessage();
        this._startGame();
    }
    listPlayers(bot, event, args) {
        let players = this.game.playerHandler.players;
        let numPlayers = players.length;
        if (numPlayers === 0) {
            bot.send(event.channelId, "No one is in this game.");
        }
        else if (numPlayers === 1) {
            bot.send(event.channelId, "Just " + mention_1.default(players[0].userId) + ", the Loner.");
        }
        else {
            bot.send(event.channelId, players.map(e => mention_1.default(e.userId)).join(", ") +
                " (" + players.length + " players)");
        }
    }
    playerUse(bot, event, args) {
        this.game.messageHandler.onMessage(event.userId, event, messageType_1.default.use);
    }
    playerPass(bot, event, args) {
        this.game.messageHandler.onMessage(event.userId, event, messageType_1.default.pass);
    }
    _sendStartingMessage() {
        let players = [];
        for (let player of this.game.playerHandler.players) {
            players.push(mention_1.default(player.userId));
        }
        this.bot.send(this.channelId, "Starting Presidents with players:\n" +
            players.join(", "));
    }
    _startGame() {
        this.game.start();
    }
    _start() {
        this._registerCommand(this.commandManager, "join", this.join);
        this._registerCommand(this.commandManager, "leave", this.leave);
        this._registerCommand(this.commandManager, "start", this.start);
        this._registerCommand(this.commandManager, "players", this.listPlayers);
        this._registerCommand(this.commandManager, "use", this.playerUse);
        this._registerCommand(this.commandManager, "pass", this.playerPass);
        this._sendAboutMessage();
        this.silentlyAddPlayer(this.initer);
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
        this.game.playerHandler.removeAllPlayers();
    }
}
exports.default = Presidents;