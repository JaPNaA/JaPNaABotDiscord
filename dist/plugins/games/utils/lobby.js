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
    settings = {};
    constructor(parentGame, bot) {
        this.parentGame = parentGame;
        this.bot = bot;
    }
    setSettings(settings) {
        this.settings = settings;
    }
    getPlayers() {
        if (this.playersPromiseRes) {
            throw new Error("Tried to getPlayers twice");
        }
        const promise = new Promise(res => this.playersPromiseRes = res);
        this.startLobby();
        return promise;
    }
    addPlayer(userId) {
        try {
            this._addPlayer(userId);
        }
        catch (err) {
            this.bot.client.send(this.parentGame.channelId, this.getJoinErrorString(err, userId));
        }
    }
    removeAllPlayers() {
        if (this.settings.dmLock) {
            for (const player of this.players) {
                this.parentGame.parentPlugin._unlockDMHandle(player, this.parentGame);
            }
        }
        this.players.length = 0;
    }
    startLobby() {
        this.sendAboutMessage();
        this._registerCommand("join", this.joinCommand);
        this._registerCommand("leave", this.leaveCommand);
        this._registerCommand("start", this.startCommand);
        this._registerCommand("players", this.listPlayersCommand);
    }
    *joinCommand(event) {
        if (this.settings.maxPlayers && this.players.length >= this.settings.maxPlayers) {
            return "No more players can join -- maximum reached.";
        }
        return this.addPlayerGetAnnounceString(event.userId);
    }
    addPlayerGetAnnounceString(userId) {
        try {
            this._addPlayer(userId);
            return (0, mention_1.default)(userId) + " has joined " + this.parentGame.gameName + "!";
        }
        catch (err) {
            return this.getJoinErrorString(err, userId);
        }
    }
    _addPlayer(userId) {
        if (this.players.includes(userId)) {
            throw new AlreadyJoinedError();
        }
        if (this.settings.dmLock) {
            if (!this.parentGame.parentPlugin._isDMLockAvailable(userId)) {
                throw new DMAlreadyLockedError();
            }
            this.parentGame.parentPlugin._lockAndGetDMHandle(userId, this.parentGame);
        }
        this.players.push(userId);
        if (this.settings.autoStart) {
            if ((this.settings.maxPlayers === undefined ||
                this.players.length <= this.settings.maxPlayers) && (this.settings.minPlayers === undefined ||
                this.players.length >= this.settings.minPlayers)) {
                this.finishPlayerGathering();
            }
        }
    }
    getJoinErrorString(err, userId) {
        if (err instanceof AlreadyJoinedError) {
            return (0, mention_1.default)(userId) + ", you're already in the game!";
        }
        else if (err instanceof DMAlreadyLockedError) {
            return "Failed to add " + (0, mention_1.default)(userId) +
                ". You're in another game which also requires DMs!";
        }
        else {
            return "Error: " + err.message;
        }
    }
    *leaveCommand(event) {
        if (!this.players.includes(event.userId)) {
            return (0, mention_1.default)(event.userId) + ", you were never in the game!";
        }
        if (this.settings.dmLock) {
            this.parentGame.parentPlugin._unlockDMHandle(event.userId, this.parentGame);
        }
        (0, removeFromArray_1.default)(this.players, event.userId);
        return (0, mention_1.default)(event.userId) + " has left the game";
    }
    *listPlayersCommand() {
        let numPlayers = this.players.length;
        if (numPlayers === 0) {
            return "No one is in this game.";
        }
        else if (numPlayers === 1) {
            return "Just " + (0, mention_1.default)(this.players[0]) + ", the Loner.";
        }
        else {
            return this.players.map(e => (0, mention_1.default)(e)).join(", ") +
                " (" + numPlayers + " players)";
        }
    }
    *startCommand() {
        const { maxPlayers, minPlayers } = this.settings;
        if (maxPlayers !== undefined && this.players.length > maxPlayers) {
            return `There are too many players. (Max is ${maxPlayers})`;
        }
        if (minPlayers !== undefined && this.players.length < minPlayers) {
            return `There are few players. (Min is ${minPlayers})`;
        }
        this.finishPlayerGathering();
        return `Starting ${this.parentGame.gameName} with players:\n` +
            this.players.map(id => (0, mention_1.default)(id)).join(", ");
    }
    finishPlayerGathering() {
        this.stopLobby();
        if (this.playersPromiseRes) {
            this.playersPromiseRes(this.players);
        }
    }
    sendAboutMessage() {
        const { maxPlayers, minPlayers } = this.settings;
        const fields = [];
        const precommmand = this.parentGame.parentPlugin.precommand.names[0];
        let numPlayersLimit = "??";
        if (maxPlayers === undefined && minPlayers === undefined) {
            numPlayersLimit = "any number of";
        }
        else if (maxPlayers !== undefined && minPlayers !== undefined) {
            if (maxPlayers == minPlayers) {
                numPlayersLimit = maxPlayers.toString();
            }
            else {
                numPlayersLimit = minPlayers + " to " + maxPlayers;
            }
        }
        else if (minPlayers !== undefined) {
            numPlayersLimit = minPlayers + "+";
        }
        else if (maxPlayers !== undefined) {
            numPlayersLimit = maxPlayers + " or fewer";
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
            description: this.settings.description,
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
class DMAlreadyLockedError extends Error {
    constructor() {
        super("DMs are already locked");
    }
}
class AlreadyJoinedError extends Error {
    constructor() {
        super("Player has already joined");
    }
}
exports.default = Lobby;
