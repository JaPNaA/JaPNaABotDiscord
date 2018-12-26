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
const cardList_1 = __importDefault(require("./cards/cardList"));
const cardSet_1 = __importDefault(require("./cards/cardSet"));
const specialUtils_1 = require("../../main/specialUtils");
const cardUtils_1 = require("./cards/cardUtils");
const card_1 = require("./cards/card");
const pile_1 = __importDefault(require("./cards/pile"));
class Player {
    constructor(userId) {
        this.userId = userId;
    }
}
class PresidentsPlayer extends Player {
    constructor(userId) {
        super(userId);
        this.cards = new cardList_1.default([]);
        this.waitingOn = false;
    }
    countJokers() {
        return this.cards.getAllJokers().length;
    }
    count(rank) {
        return this.cards.getAllRank(rank).length;
    }
    has(rank, amount) {
        let count = this.count(rank);
        if (count >= amount) {
            return true;
        }
        else {
            return false;
        }
    }
    hasJokers(amount) {
        let count = this.countJokers();
        if (count >= amount) {
            return true;
        }
        else {
            return false;
        }
    }
    use(rank, amount) {
        let cards = this.cards.getAllRank(rank).slice(0, amount);
        this.useCards(cards, amount);
        return cards;
    }
    useJoker(amount) {
        let cards = this.cards.getAllJokers().slice(0, amount);
        this.useCards(cards, amount);
        return cards;
    }
    useCards(cards, amount) {
        if (cards.length < amount) {
            throw new Error("Not enough cards");
        }
        for (let card of cards) {
            this.cards.remove(card);
        }
    }
    separateBurnAndNormalCards() {
        let normalCards = [];
        let burnCards = [];
        for (let card of this.cards) {
            if (card.isRank(cardUtils_1.Rank.n2) || card.isJoker()) {
                burnCards.push(card);
            }
            else {
                normalCards.push(card);
            }
        }
        return { burnCards: burnCards, normalCards: normalCards };
    }
}
var Action;
(function (Action) {
    Action[Action["ace"] = 0] = "ace";
    Action[Action["n2"] = 1] = "n2";
    Action[Action["n3"] = 2] = "n3";
    Action[Action["n4"] = 3] = "n4";
    Action[Action["n5"] = 4] = "n5";
    Action[Action["n6"] = 5] = "n6";
    Action[Action["n7"] = 6] = "n7";
    Action[Action["n8"] = 7] = "n8";
    Action[Action["n9"] = 8] = "n9";
    Action[Action["n10"] = 9] = "n10";
    Action[Action["jack"] = 10] = "jack";
    Action[Action["knight"] = 11] = "knight";
    Action[Action["queen"] = 12] = "queen";
    Action[Action["king"] = 13] = "king";
    Action[Action["joker"] = 14] = "joker";
    Action[Action["burn"] = 15] = "burn";
    Action[Action["run"] = 16] = "run";
    Action[Action["endGame"] = 17] = "endGame";
})(Action || (Action = {}));
;
const cardHierarchy = [
    cardUtils_1.Rank.n3, cardUtils_1.Rank.n4, cardUtils_1.Rank.n5, cardUtils_1.Rank.n6, cardUtils_1.Rank.n7, cardUtils_1.Rank.n8, cardUtils_1.Rank.n9, cardUtils_1.Rank.n10,
    cardUtils_1.Rank.jack, cardUtils_1.Rank.queen, cardUtils_1.Rank.king, cardUtils_1.Rank.ace
];
class Logic {
    constructor(botHooks, playerIds) {
        this.bot = botHooks;
        this.players = [];
        this.deck = new deck_1.default();
        this.pile = new pile_1.default();
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
                    yield this.waitForValidTurn(player);
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
            value: "`g!use [rank/action]` to use cards\n" +
                "`g!use _rank_ _[amount]_` to put down cards\n" +
                "rank: a | 2-10 | j | c | q | k\n" +
                "amount: number, defaults to the most you can play"
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
    waitForValidTurn(player) {
        return __awaiter(this, void 0, void 0, function* () {
            this.bot.sendDM(player.userId, "It's your turn!");
            while (true) {
                let response = yield this.waitForTurn(player);
                let result = this.tryParseAndDoAction(response.arguments, player);
                if (!result.validSyntax) {
                    this.bot.sendDM(player.userId, "Invalid syntax");
                }
                else if (!result.validAction) {
                    this.bot.sendDM(player.userId, result.message);
                }
                else {
                    break;
                }
            }
        });
    }
    waitForTurn(player) {
        let promise = new Promise(function (resolve, reject) {
            player.waitingOn = true;
            player.resolveWait = resolve;
        });
        return promise;
    }
    tryParseAndDoAction(args, player) {
        if (args === null) {
            throw new Error("No arguments");
        }
        let cleanArgs = args.trim().toLowerCase().split(/\s/g);
        const action = this.parseAction(cleanArgs[0]);
        const amount = parseInt(cleanArgs[1]);
        if (action === null) {
            return { validSyntax: false, validAction: false, message: null };
        }
        let result = this.tryDoAction(action, amount, player);
        if (!result.valid) {
            return {
                validAction: false,
                validSyntax: true,
                message: result.message
            };
        }
        return { validAction: true, validSyntax: true, message: null };
    }
    parseAction(str) {
        switch (str) {
            case "a":
            case "ace":
            case "1":
                return Action.ace;
            case "2":
                return Action.n2;
            case "3":
                return Action.n3;
            case "4":
                return Action.n4;
            case "5":
                return Action.n5;
            case "6":
                return Action.n6;
            case "7":
                return Action.n7;
            case "8":
                return Action.n8;
            case "9":
                return Action.n9;
            case "10":
                return Action.n10;
            case "j":
                return Action.jack;
            case "c":
                return Action.knight;
            case "q":
                return Action.queen;
            case "k":
                return Action.king;
            case "jk":
                return Action.joker;
            case "b":
                return Action.burn;
            case "r":
                return Action.run;
            case "e":
                return Action.endGame;
            default:
                return null;
        }
    }
    tryDoAction(action, amount, player) {
        let valid = true;
        let message = null;
        switch (action) {
            case Action.endGame: {
                const result = this.tryActionEndGame(player);
                if (!result) {
                    valid = false;
                    message = "Cannot end game";
                }
                break;
            }
            case Action.burn: {
                const result = this.tryActionBurn(player);
                if (!result) {
                    valid = false;
                    message = "Cannot burn cards";
                }
                break;
            }
            case Action.run: {
                const result = this.tryActionRun(player);
                if (!result) {
                    valid = false;
                    message = "Cannot run";
                }
                break;
            }
            default: {
                const result = this.tryPlayCard(player, action, amount);
                if (!result.valid) {
                    valid = false;
                    message = result.message;
                }
            }
        }
        return { valid: valid, message: message };
    }
    tryActionEndGame(player) {
        let result = this.tryEndGameWithBurnCards(player);
        // TODO: implement win by run
        return result;
    }
    tryEndGameWithBurnCards(player) {
        const { normalCards, burnCards } = player.separateBurnAndNormalCards();
        // rule: last card cannot be a burn card 
        if (normalCards.length < 1) {
            return false;
        }
        // cannot use end game if there's no burn card
        if (burnCards.length < 1) {
            return false;
        } // TODO: implement end game without burn
        let rank = normalCards[0].rank;
        for (let i = 1; i < normalCards.length; i++) {
            // cannot make set
            if (!normalCards[i].isRank(rank)) {
                return false;
            }
            ;
        }
        // TODO: fix problem, in case requires more than one '2' to burn
        for (let burnCard of burnCards) {
            this.playerUseSet(new cardSet_1.default([burnCard]));
        }
        this.playerUseSet(new cardSet_1.default(player.use(rank, normalCards.length)));
        return true;
    }
    tryActionBurn(player) {
        let topSet = this.pile.getTopSet();
        if (!topSet) {
            return false;
        }
        let card = topSet.cards[0];
        if (!(card instanceof card_1.NormalCard)) {
            return false;
        }
        if (player.has(card.rank, topSet.cards.length)) {
            this.playerUseSet(new cardSet_1.default(player.use(card.rank, topSet.cards.length)));
            return true;
        }
        return false;
    }
    tryActionRun(player) {
        let topSet = this.pile.getTopSet();
        if (!topSet) {
            return false;
        }
        let card = topSet.cards[0];
        if (!(card instanceof card_1.NormalCard)) {
            return false;
        }
        let requiredRank = cardHierarchy[cardHierarchy.indexOf(card.rank) + 1];
        if (!requiredRank) {
            return false;
        }
        if (player.has(requiredRank, topSet.cards.length)) {
            this.playerUseSet(new cardSet_1.default(player.use(card.rank, topSet.cards.length)));
            return true;
        }
        return false;
    }
    tryPlayCard(player, action, amount) {
        let topSet = this.pile.getTopSet();
        let requiredAmount;
        if (topSet) {
            if (topSet.cards[0].isRank(cardUtils_1.Rank.n2) || topSet.cards[0].isJoker()) {
                requiredAmount = null;
            }
            else {
                requiredAmount = topSet.cards.length;
            }
        }
        else {
            requiredAmount = null;
        }
        let maxAmount;
        let rank = cardUtils_1.Rank.ace;
        let joker = false;
        switch (action) {
            case Action.n2:
                maxAmount = player.count(cardUtils_1.Rank.n2);
                rank = cardUtils_1.Rank.n2;
                break;
            case Action.n3:
                maxAmount = player.count(cardUtils_1.Rank.n3);
                rank = cardUtils_1.Rank.n3;
                break;
            case Action.n4:
                maxAmount = player.count(cardUtils_1.Rank.n4);
                rank = cardUtils_1.Rank.n4;
                break;
            case Action.n5:
                maxAmount = player.count(cardUtils_1.Rank.n5);
                rank = cardUtils_1.Rank.n5;
                break;
            case Action.n6:
                maxAmount = player.count(cardUtils_1.Rank.n6);
                rank = cardUtils_1.Rank.n6;
                break;
            case Action.n7:
                maxAmount = player.count(cardUtils_1.Rank.n7);
                rank = cardUtils_1.Rank.n7;
                break;
            case Action.n8:
                maxAmount = player.count(cardUtils_1.Rank.n8);
                rank = cardUtils_1.Rank.n8;
                break;
            case Action.n9:
                maxAmount = player.count(cardUtils_1.Rank.n9);
                rank = cardUtils_1.Rank.n9;
                break;
            case Action.n10:
                maxAmount = player.count(cardUtils_1.Rank.n10);
                rank = cardUtils_1.Rank.n10;
                break;
            case Action.jack:
                maxAmount = player.count(cardUtils_1.Rank.jack);
                rank = cardUtils_1.Rank.jack;
                break;
            case Action.queen:
                maxAmount = player.count(cardUtils_1.Rank.queen);
                rank = cardUtils_1.Rank.queen;
                break;
            case Action.king:
                maxAmount = player.count(cardUtils_1.Rank.king);
                rank = cardUtils_1.Rank.king;
                break;
            case Action.ace:
                maxAmount = player.count(cardUtils_1.Rank.ace);
                rank = cardUtils_1.Rank.ace;
                break;
            case Action.joker:
                maxAmount = player.countJokers();
                joker = true;
                break;
            default:
                throw new Error("Unknown Error");
        }
        if (amount) {
            if (amount > maxAmount) {
                return { valid: false, message: "You don't have enough of those cards" };
            }
            else if (amount !== requiredAmount) {
                return { valid: false, message: "You cannot play that amount of cards" };
            }
        }
        else if (requiredAmount) {
            if (requiredAmount > maxAmount) {
                return { valid: false, message: "You don't have enough of those cards" };
            }
        }
        else {
            amount = maxAmount;
        }
        if (joker) {
            this.playerUseSet(new cardSet_1.default(player.useJoker(requiredAmount || amount)));
        }
        else {
            this.playerUseSet(new cardSet_1.default(player.use(rank, requiredAmount || amount)));
        }
        return { valid: true, message: "" };
    }
    playerUseSet(set) {
        this.pile.add(set);
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
