"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const removeFromArray_1 = __importDefault(require("../../../main/utils/removeFromArray"));
const mention_1 = __importDefault(require("../../../main/utils/str/mention"));
class Lobby {
    parentGame;
    bot;
    players = [];
    registeredCommandNames = [];
    playersPromiseRes;
    minPlayers;
    maxPlayers;
    description;
    constructor(parentGame, bot) {
        this.parentGame = parentGame;
        this.bot = bot;
    }
    setSettings({ minPlayers, maxPlayers, description }) {
        this.minPlayers = minPlayers;
        this.maxPlayers = maxPlayers;
        this.description = description;
    }
    addPlayer(player) {
        if (!this.players.includes(player)) {
            this.players.push(player);
        }
    }
    getPlayers() {
        if (this.playersPromiseRes) {
            throw new Error("Tried to getPlayers twice");
        }
        const promise = new Promise(res => this.playersPromiseRes = res);
        this.startLobby();
        return promise;
    }
    joinCommand(event) {
        if (this.players.includes(event.userId)) {
            this.bot.client.send(event.channelId, (0, mention_1.default)(event.userId) + ", you're already in the game!");
            return;
        }
        if (this.maxPlayers && this.players.length >= this.maxPlayers) {
            this.bot.client.send(event.channelId, "No more players can join -- maximum reached.");
        }
        this.players.push(event.userId);
        this.bot.client.send(event.channelId, (0, mention_1.default)(event.userId) + " has joined the game!");
    }
    leaveCommand(event) {
        if (!this.players.includes(event.userId)) {
            this.bot.client.send(event.channelId, (0, mention_1.default)(event.userId) + ", you were never in the game!");
            return;
        }
        (0, removeFromArray_1.default)(this.players, event.userId);
        this.bot.client.send(event.channelId, (0, mention_1.default)(event.userId) + " has left the game");
    }
    listPlayersCommand(event) {
        let numPlayers = this.players.length;
        if (numPlayers === 0) {
            this.bot.client.send(event.channelId, "No one is in this game.");
        }
        else if (numPlayers === 1) {
            this.bot.client.send(event.channelId, "Just " + (0, mention_1.default)(this.players[0]) + ", the Loner.");
        }
        else {
            this.bot.client.send(event.channelId, this.players.map(e => (0, mention_1.default)(e)).join(", ") +
                " (" + numPlayers + " players)");
        }
    }
    startCommand(event) {
        if (this.maxPlayers !== undefined && this.players.length > this.maxPlayers) {
            this.bot.client.send(event.channelId, `There are too many players. (Max is ${this.maxPlayers})`);
            return;
        }
        if (this.minPlayers !== undefined && this.players.length < this.minPlayers) {
            this.bot.client.send(event.channelId, `There are few players. (Min is ${this.minPlayers})`);
            return;
        }
        this.stopLobby();
        if (this.playersPromiseRes) {
            this.playersPromiseRes(this.players);
        }
    }
    startLobby() {
        this.sendAboutMessage();
        this._registerCommand("join", this.joinCommand);
        this._registerCommand("leave", this.leaveCommand);
        this._registerCommand("start", this.startCommand);
        this._registerCommand("players", this.listPlayersCommand);
    }
    sendAboutMessage() {
        const fields = [];
        const precommmand = this.parentGame.parentPlugin.precommand.names[0];
        let numPlayersLimit = "??";
        if (this.maxPlayers === undefined && this.minPlayers === undefined) {
            numPlayersLimit = "any number of";
        }
        else if (this.maxPlayers !== undefined && this.minPlayers !== undefined) {
            if (this.maxPlayers == this.minPlayers) {
                numPlayersLimit = this.maxPlayers.toString();
            }
            else {
                numPlayersLimit = this.minPlayers + " to " + this.maxPlayers;
            }
        }
        else if (this.minPlayers !== undefined) {
            numPlayersLimit = this.minPlayers + "+";
        }
        else if (this.maxPlayers !== undefined) {
            numPlayersLimit = this.maxPlayers + " or fewer";
        }
        fields.push({
            name: "Lobby Commands",
            value: "**Joining**\n" +
                "Join this game by typing `" + precommmand + "join`\n" +
                "and you can leave by typing `" + precommmand + "leave`.\n" +
                "You can list all the players with `" + precommmand + "players`" +
                "There can be " + numPlayersLimit + " players.\n" +
                "**Starting**\n" +
                "Once all the players are in, type `" + precommmand + "start` to start the game"
        });
        this.bot.client.sendEmbed(this.parentGame.channelId, {
            color: this.bot.config.themeColor,
            title: this.parentGame.gameName,
            description: this.description,
            fields: fields
        });
    }
    stopLobby() {
        for (const command of this.registeredCommandNames) {
            this.parentGame.commandManager.unregister(command);
        }
    }
    _registerCommand(name, callback) {
        this.parentGame.commandManager.register(name, this.parentGame.pluginName, callback.bind(this));
        this.registeredCommandNames.push(name);
    }
}
exports.default = Lobby;
