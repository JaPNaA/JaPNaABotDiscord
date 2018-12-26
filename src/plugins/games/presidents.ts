import Game from "./game";
import BotHooks from "../../main/bot/botHooks";
import Games from "../games";
import Deck from "./cards/deck";
import CardsList from "./cards/cardList";
import CardSet from "./cards/cardSet";
import { DiscordCommandEvent } from "../../main/events";
import { mention } from "../../main/specialUtils";
import { Rank } from "./cards/cardUtils";
import { Card, NormalCard } from "./cards/card";
import Pile from "./cards/pile";

class Player {
    userId: string;

    constructor(userId: string) {
        this.userId = userId;
    }
}

class PresidentsPlayer extends Player {
    cards: CardsList;
    waitingOn: boolean;
    resolveWait?: (value: DiscordCommandEvent) => void;

    constructor(userId: string) {
        super(userId);
        this.cards = new CardsList([]);
        this.waitingOn = false;
    }

    public countJokers(): number {
        return this.cards.getAllJokers().length;
    }
    public count(rank: Rank): number {
        return this.cards.getAllRank(rank).length;
    }

    public has(rank: Rank, amount: number): boolean {
        let count = this.count(rank);
        if (count >= amount) { return true; }
        else { return false; }
    }

    public hasJokers(amount: number): boolean {
        let count = this.countJokers();
        if (count >= amount) { return true; }
        else { return false; }
    }

    public use(rank: Rank, amount: number): Card[] {
        let cards = this.cards.getAllRank(rank).slice(0, amount);
        this.useCards(cards, amount);
        return cards;
    }

    public useJoker(amount: number): Card[] {
        let cards = this.cards.getAllJokers().slice(0, amount);
        this.useCards(cards, amount);
        return cards;
    }

    private useCards(cards: Card[], amount: number) {
        if (cards.length < amount) { throw new Error("Not enough cards"); }

        for (let card of cards) {
            this.cards.remove(card);
        }
    }

    public separateBurnAndNormalCards(): {
        burnCards: Card[],
        normalCards: NormalCard[]
    } {
        let normalCards: NormalCard[] = [];
        let burnCards: Card[] = [];

        for (let card of this.cards) {
            if (card.isRank(Rank.n2) || card.isJoker()) {
                burnCards.push(card);
            } else {
                normalCards.push(card as NormalCard);
            }
        }
        return { burnCards: burnCards, normalCards: normalCards };
    }
}

enum Action {
    ace, n2, n3, n4, n5, n6, n7, n8, n9, n10, jack, knight, queen, king, joker, burn, run, endGame
};

const cardHierarchy: Rank[] = [
    Rank.n3, Rank.n4, Rank.n5, Rank.n6, Rank.n7, Rank.n8, Rank.n9, Rank.n10, 
    Rank.jack, Rank.queen, Rank.king, Rank.ace
];

class Logic {
    bot: BotHooks;
    players: PresidentsPlayer[];

    deck: Deck;
    pile: Pile;

    gameLoopPromise: Promise<void>;

    constructor(botHooks: BotHooks, playerIds: string[]) {
        this.bot = botHooks;
        this.players = [];

        this.deck = new Deck();
        this.pile = new Pile();

        this.init(playerIds);
        this.gameLoopPromise = this.gameLoop();
    }

    public onUseCards(event: DiscordCommandEvent, args: string) {
        let userId = event.userId;
        let user = this.players.find(e => e.userId === userId);
        if (!user || !user.waitingOn) return;

        if (user.resolveWait) {
            user.resolveWait(event);
        }
    }

    private init(playerIds: string[]) {
        this.initPlayers(playerIds);
        this.deck.shuffle();
        this.distributeCards();
    }

    private initPlayers(playerIds: string[]) {
        for (let playerId of playerIds) {
            this.players.push(new PresidentsPlayer(playerId));
        }
    }

    private distributeCards() {
        let numPlayers = this.players.length;
        let numCards = this.deck.cards.length;
        let cardsPerPlayer = Math.floor(numCards / numPlayers);

        if (cardsPerPlayer > 18) { cardsPerPlayer = 18; }

        for (let player of this.players) {
            for (let i: number = 0; i < cardsPerPlayer; i++) {
                let card = this.deck.takeTop();
                if (!card) { throw new Error("Unknown Error"); }
                player.cards.add(card);
            }

            player.cards.sortByRank();
        }
    }

    private async gameLoop(): Promise<void> {
        this.sendEveryoneTheirDeck();

        while (true) {
            for (let player of this.players) {
                await this.waitForValidTurn(player);
                this.sendOnesDeck(player);
            }
        }
    }

    private sendEveryoneTheirDeck() {
        for (let player of this.players) {
            this.sendOnesDeck(player);
        }
    }

    private sendOnesDeck(player: PresidentsPlayer) {
        let deckStr = "";
        for (let card of player.cards) {
            deckStr += card.toShortMD();
        }

        let fields: object[] = [];

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
        })
    }

    private async waitForValidTurn(player: PresidentsPlayer) {
        this.bot.sendDM(player.userId, "It's your turn!");
        while (true) {
            let response = await this.waitForTurn(player);
            let result = this.tryParseAndDoAction(response.arguments, player);

            if (!result.validSyntax) {
                this.bot.sendDM(player.userId, "Invalid syntax");
            } else if (!result.validAction) {
                this.bot.sendDM(player.userId, result.message as string);
            } else {
                break;
            }
        }
    }

    private waitForTurn(player: PresidentsPlayer): Promise<DiscordCommandEvent> {
        let promise = new Promise<DiscordCommandEvent>(function (resolve, reject): void {
            player.waitingOn = true;
            player.resolveWait = resolve;
        });

        return promise;
    }

    private tryParseAndDoAction(args: string | null, player: PresidentsPlayer): {
        validSyntax: boolean,
        validAction: boolean,
        message: string | null
    } {
        if (args === null) { throw new Error("No arguments"); }

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

    private parseAction(str: string): Action | null {
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

    private tryDoAction(action: Action, amount: number, player: PresidentsPlayer): {
        valid: boolean,
        message: string | null
    } {
        let valid: boolean = true;
        let message: string | null = null;

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

    private tryActionEndGame(player: PresidentsPlayer): boolean {
        let result = this.tryEndGameWithBurnCards(player);

        // TODO: implement win by run

        return result;
    }

    private tryEndGameWithBurnCards(player: PresidentsPlayer): boolean {
        const { normalCards, burnCards } = player.separateBurnAndNormalCards();

        // rule: last card cannot be a burn card 
        if (normalCards.length < 1) { return false; }
        // cannot use end game if there's no burn card
        if (burnCards.length < 1) { return false; } // TODO: implement end game without burn

        let rank = normalCards[0].rank;
        for (let i = 1; i < normalCards.length; i++) {
            // cannot make set
            if (!normalCards[i].isRank(rank)) { return false };
        }

        // TODO: fix problem, in case requires more than one '2' to burn
        for (let burnCard of burnCards) {
            this.playerUseSet(
                new CardSet([burnCard])
            );
        }

        this.playerUseSet(
            new CardSet(player.use(rank, normalCards.length))
        );

        return true;
    }

    private tryActionBurn(player: PresidentsPlayer): boolean {
        let topSet = this.pile.getTopSet();
        if (!topSet) { return false; }
        let card = topSet.cards[0];
        if (!(card instanceof NormalCard)) { return false; }

        if (player.has(card.rank, topSet.cards.length)) {
            this.playerUseSet(
                new CardSet(player.use(card.rank, topSet.cards.length))
            );

            return true;
        }
        return false;
    }

    private tryActionRun(player: PresidentsPlayer): boolean {
        let topSet = this.pile.getTopSet();
        if (!topSet) { return false; }
        let card = topSet.cards[0];
        if (!(card instanceof NormalCard)) { return false; }

        let requiredRank = cardHierarchy[cardHierarchy.indexOf(card.rank) + 1];
        if (!requiredRank) { return false; }

        if (player.has(requiredRank, topSet.cards.length)) {
            this.playerUseSet(
                new CardSet(player.use(card.rank, topSet.cards.length))
            );

            return true;
        }
        return false;
    }

    private tryPlayCard(player: PresidentsPlayer, action: Action, amount: number): {
        valid: boolean,
        message: string
    } {
        let topSet = this.pile.getTopSet();
        let requiredAmount: number | null;
        if (topSet) {
            if (topSet.cards[0].isRank(Rank.n2) || topSet.cards[0].isJoker()) {
                requiredAmount = null;
            } else {
                requiredAmount = topSet.cards.length;
            }
        } else {
            requiredAmount = null;
        }

        let maxAmount: number;
        let rank: Rank = Rank.ace;
        let joker: boolean = false;

        switch (action) {
            case Action.n2:
                maxAmount = player.count(Rank.n2);
                rank = Rank.n2;
                break;
            case Action.n3:
                maxAmount = player.count(Rank.n3);
                rank = Rank.n3;
                break;
            case Action.n4:
                maxAmount = player.count(Rank.n4);
                rank = Rank.n4;
                break;
            case Action.n5:
                maxAmount = player.count(Rank.n5);
                rank = Rank.n5;
                break;
            case Action.n6:
                maxAmount = player.count(Rank.n6);
                rank = Rank.n6;
                break;
            case Action.n7:
                maxAmount = player.count(Rank.n7);
                rank = Rank.n7;
                break;
            case Action.n8:
                maxAmount = player.count(Rank.n8);
                rank = Rank.n8;
                break;
            case Action.n9:
                maxAmount = player.count(Rank.n9);
                rank = Rank.n9;
                break;
            case Action.n10:
                maxAmount = player.count(Rank.n10);
                rank = Rank.n10;
                break;
            case Action.jack:
                maxAmount = player.count(Rank.jack);
                rank = Rank.jack;
                break;
            case Action.queen:
                maxAmount = player.count(Rank.queen);
                rank = Rank.queen;
                break;
            case Action.king:
                maxAmount = player.count(Rank.king);
                rank = Rank.king;
                break;
            case Action.ace:
                maxAmount = player.count(Rank.ace);
                rank = Rank.ace;
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
            } else if (amount !== requiredAmount) {
                return { valid: false, message: "You cannot play that amount of cards" };
            }
        } else if (requiredAmount) {
            if (requiredAmount > maxAmount) {
                return { valid: false, message: "You don't have enough of those cards" };
            }
        } else {
            amount = maxAmount;
        }

        if (joker) {
            this.playerUseSet(
                new CardSet(player.useJoker(requiredAmount || amount))
            )
        } else {
            this.playerUseSet(
                new CardSet(player.use(rank, requiredAmount || amount))
            );
        }

        return { valid: true, message: "" };
    }

    private playerUseSet(set: CardSet) {
        this.pile.add(set);
    }
}

enum AlertCanUseInDMState {
    notAlerted, alerted, okThen
}

class Presidents extends Game {
    _gamePluginName: string = "presidents";
    _pluginName: string = "game." + this._gamePluginName;
    gameName: string = "Presidents";

    channelId: string;
    playerIds: string[];

    logic?: Logic;

    alertCanUseInDMsState: AlertCanUseInDMState = AlertCanUseInDMState.notAlerted;
    started: boolean;

    constructor(botHooks: BotHooks, parentPlugin: Games, channelId: string, initer: string) {
        super(botHooks, parentPlugin);

        this.channelId = channelId;
        this.playerIds = [];

        // initer automatically joins
        let result = this._addPlayer(initer);
        if (result.hasError) {
            botHooks.send(channelId, result.message);
        }

        this.started = false;
    }

    join(bot: BotHooks, event: DiscordCommandEvent, args: string) {
        let userId = event.userId;
        let result = this._addPlayer(userId);
        bot.send(event.channelId, result.message);
    }

    _addPlayer(userId: string): { hasError: boolean, message: string } {
        let hasError: boolean = false;
        let message: string;

        if (this.parentPlugin._isDMLockAvailable(userId)) {
            this.parentPlugin._lockAndGetDMHandle(userId, this);
            this.playerIds.push(userId);

            message = mention(userId) + ` has joined ${this.gameName}!`;
        } else {
            message = mention(userId) +
                ", you cannot join because you're in another game which requires " +
                "Direct Messages\n" +
                "You may do `g!leave all` to leave all games."; // TODO: g!leave all

            hasError = true;
        }

        return { hasError, message };
    }

    leave(bot: BotHooks, event: DiscordCommandEvent, args: string) {
        let userId = event.userId;
        let index = this.playerIds.indexOf(userId);

        this.playerIds.splice(index, 1);

        if (index < 0) {
            bot.send(event.channelId, mention(userId) + ", you were never in the game!");
        } else {
            bot.send(event.channelId, mention(userId) + " has left the game");
        }
    }

    start(bot: BotHooks, event: DiscordCommandEvent, args: string) {
        this.started = true;

        this._sendStartingMessage();
        this._startGameLogic();
    }

    listPlayers(bot: BotHooks, event: DiscordCommandEvent, args: string) {
        let numPlayers = this.playerIds.length;

        if (numPlayers === 0) {
            bot.send(event.channelId, "No one is in this game.");
        } else if (numPlayers === 1) {
            bot.send(event.channelId, "Just " + mention(this.playerIds[0]) + ", the Loner.");
        } else {
            bot.send(event.channelId,
                this.playerIds.map(e => mention(e)).join(", ") + " (" + this.playerIds.length + " players)"
            );
        }
    }

    _sendStartingMessage() {
        let players: string[] = [];
        for (let playerId of this.playerIds) {
            players.push(mention(playerId));
        }
        this.bot.send(this.channelId, "Starting Presidents with players:\n" + players.join(", "));
    }


    _startGameLogic() {
        this.logic = new Logic(this.bot, this.playerIds);
    }

    useCards(bot: BotHooks, event: DiscordCommandEvent, args: string) {
        if (!this.logic || !this.started) return;

        this.logic.onUseCards(event, args);

        if (!event.isDM) {
            this.alertCanUseInDM();
        }
    }

    private alertCanUseInDM() {
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

    private alertCanUseInDMFirst() {
        this.bot.send(this.channelId,
            "Uhm, you know you can do that directly in " +
            "your Direct Messages?... right?"
        );
        this.alertCanUseInDMsState = AlertCanUseInDMState.alerted;
    }

    private alertCanUseInDMOkThen() {
        this.bot.send(this.channelId,
            "Ok then, don't want to do that in your Direct " +
            "Messages? That's fine, I know it can get loney " +
            "in there."
        );
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
        const fields: object[] = [];
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

export default Presidents;