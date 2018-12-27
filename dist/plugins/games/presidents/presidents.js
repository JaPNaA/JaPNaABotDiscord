"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const game_1 = __importDefault(require("../game"));
const specialUtils_1 = require("../../../main/specialUtils");
const game_2 = __importDefault(require("./game"));
const errors_1 = __importDefault(require("./errors"));
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
        this.channelId = channelId;
        this.game = new game_2.default(this.bot, this.parentPlugin, this);
        this.game.playerHandler.addPlayer(initer);
    }
    join(bot, event, args) {
        let userId = event.userId;
        let result = this.game.playerHandler.addPlayer(userId);
        if (result.succeeded) {
            bot.send(event.channelId, specialUtils_1.mention(userId) + ` has joined ${this.gameName}!`);
        }
        else if (result.errorCode === errors_1.default.alreadyJoined) {
            bot.send(event.channelId, specialUtils_1.mention(userId) + ", you're already in the game!");
        }
        else if (result.errorCode === errors_1.default.DMAlreadyLocked) {
            bot.send(event.channelId, specialUtils_1.mention(userId) +
                ", you're in another game which also requires DMs!");
        }
        else {
            bot.send(event.channelId, "Failed adding " + specialUtils_1.mention(userId) +
                " to game: Unknown Error.");
        }
    }
    leave(bot, event, args) {
        let userId = event.userId;
        let result = this.game.playerHandler.removePlayer(userId);
        if (result) {
            bot.send(event.channelId, specialUtils_1.mention(userId) + " has left the game");
        }
        else {
            bot.send(event.channelId, specialUtils_1.mention(userId) + ", you were never in the game!");
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
            bot.send(event.channelId, "Just " + specialUtils_1.mention(players[0].userId) + ", the Loner.");
        }
        else {
            bot.send(event.channelId, players.map(e => specialUtils_1.mention(e.userId)).join(", ") +
                " (" + players.length + " players)");
        }
    }
    playerUseCard(bot, event, args) {
        this.game.messageHandler.onMessage(event.userId, event);
    }
    _sendStartingMessage() {
        let players = [];
        for (let player of this.game.playerHandler.players) {
            players.push(specialUtils_1.mention(player.userId));
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
        this._registerCommand(this.commandManager, "use", this.playerUseCard);
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
        this.game.playerHandler.removeAllPlayers();
    }
}
exports.default = Presidents;
