"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    }
}
class PresidentsPlayer extends Player {
    constructor(userId) {
        super(userId);
        this.cards = new pile_1.default();
        this.waitingOn = false;
    }
}
class Logic {
    constructor(botHooks, playerIds) {
        this.bot = botHooks;
        this.players = [];
        this.deck = new deck_1.default();
        this.pile = new pile_1.default();
        this.topSet = null;
        this.init(playerIds);
        this.gameLoopPromise = this.gameLoop();
    }
    onUseCards(event, args) {
        let userId = event.userId;
        let user = this.players.find(e => e.userId === userId);
        if (!user || !user.waitingOn)
            return;
        if (user.resolveWait) {
            user.resolveWait(event);
        }
    }
    init(playerIds) {
        this.initPlayers(playerIds);
        this.deck.shuffle();
        this.distributeCards();
    }
    initPlayers(playerIds) {
        for (let playerId of playerIds) {
            this.players.push(new PresidentsPlayer(playerId));
        }
    }
    distributeCards() {
        let numPlayers = this.players.length;
        let numCards = this.deck.cards.length;
        let cardsPerPlayer = Math.floor(numCards / numPlayers);
        if (cardsPerPlayer > 18) {
            cardsPerPlayer = 18;
        }
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
    gameLoop() {
        return __awaiter(this, void 0, void 0, function* () {
            this.sendEveryoneTheirDeck();
            while (true) {
                for (let player of this.players) {
                    yield this.waitForTurn(player);
                    this.sendOnesDeck(player);
                }
            }
        });
    }
    sendEveryoneTheirDeck() {
        for (let player of this.players) {
            this.sendOnesDeck(player);
        }
    }
    sendOnesDeck(player) {
        let deckStr = "";
        for (let card of player.cards) {
            deckStr += card.toShortMD();
        }
        let fields = [];
        fields.push({
            name: "Commands",
            value: "`g!use [rank][suit]` or `g!use [suit][rank]` to use cards\n" +
                "`g!use [possibleMove]` to use a suggested move"
        });
        fields.push({
            name: "Possible moves",
            value: "// TODO: Get possible moves"
        });
        this.bot.sendDM(player.userId, {
            embed: {
                title: "Your deck",
                description: deckStr,
                color: this.bot.config.themeColor,
                fields: fields
            }
        });
    }
    waitForTurn(player) {
        let promise = new Promise(function (resolve, reject) {
            player.waitingOn = true;
            player.resolveWait = resolve;
        });
        this.bot.sendDM(player.userId, "It's your turn!");
        return promise;
    }
}
var AlertCanUseInDMState;
(function (AlertCanUseInDMState) {
    AlertCanUseInDMState[AlertCanUseInDMState["notAlerted"] = 0] = "notAlerted";
    AlertCanUseInDMState[AlertCanUseInDMState["alerted"] = 1] = "alerted";
    AlertCanUseInDMState[AlertCanUseInDMState["okThen"] = 2] = "okThen";
})(AlertCanUseInDMState || (AlertCanUseInDMState = {}));
class Presidents extends game_1.default {
    constructor(botHooks, parentPlugin, channelId, initer) {
        super(botHooks, parentPlugin);
        this._gamePluginName = "presidents";
        this._pluginName = "game." + this._gamePluginName;
        this.gameName = "Presidents";
        this.alertCanUseInDMsState = AlertCanUseInDMState.notAlerted;
        this.channelId = channelId;
        this.playerIds = [];
        // initer automatically joins
        let result = this._addPlayer(initer);
        if (result.hasError) {
            botHooks.send(channelId, result.message);
        }
        this.started = false;
    }
    join(bot, event, args) {
        let userId = event.userId;
        let result = this._addPlayer(userId);
        bot.send(event.channelId, result.message);
    }
    _addPlayer(userId) {
        let hasError = false;
        let message;
        if (this.parentPlugin._isDMLockAvailable(userId)) {
            this.parentPlugin._lockAndGetDMHandle(userId, this);
            this.playerIds.push(userId);
            message = specialUtils_1.mention(userId) + ` has joined ${this.gameName}!`;
        }
        else {
            message = specialUtils_1.mention(userId) +
                ", you cannot join because you're in another game which requires " +
                "Direct Messages\n" +
                "You may do `g!leave all` to leave all games."; // TODO: g!leave all
            hasError = true;
        }
        return { hasError, message };
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
        this.logic = new Logic(this.bot, this.playerIds);
    }
    useCards(bot, event, args) {
        if (!this.logic || !this.started)
            return;
        this.logic.onUseCards(event, args);
        if (!event.isDM) {
            this.alertCanUseInDM();
        }
    }
    alertCanUseInDM() {
        switch (this.alertCanUseInDMsState) {
            case AlertCanUseInDMState.notAlerted:
                this.alertCanUseInDMFirst();
                break;
            case AlertCanUseInDMState.alerted:
                this.alertCanUseInDMOkThen();
                break;
            case AlertCanUseInDMState.okThen:
                break;
        }
    }
    alertCanUseInDMFirst() {
        this.bot.send(this.channelId, "Uhm, you know you can do that directly in " +
            "your Direct Messages?... right?");
        this.alertCanUseInDMsState = AlertCanUseInDMState.alerted;
    }
    alertCanUseInDMOkThen() {
        this.bot.send(this.channelId, "Ok then, don't want to do that in your Direct " +
            "Messages? That's fine, I know it can get loney " +
            "in there.");
        this.alertCanUseInDMsState = AlertCanUseInDMState.okThen;
    }
    _start() {
        // Server only commands
        this._registerCommand(this.commandManager, "join", this.join);
        this._registerCommand(this.commandManager, "leave", this.leave);
        this._registerCommand(this.commandManager, "start", this.start);
        this._registerCommand(this.commandManager, "players", this.listPlayers);
        // Direct Message only commands
        this._registerCommand(this.commandManager, "use", this.useCards);
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
                "You can list all the players with `" + precommmand + "players`\n" +
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
