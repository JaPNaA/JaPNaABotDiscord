import Game from "./game";
import BotHooks from "../../main/bot/botHooks";
import Games from "../games";
import Deck from "./cards/deck";
import Pile from "./cards/pile";
import CardSet from "./cards/cardSet";
import { DiscordCommandEvent } from "../../main/events";
import { mention } from "../../main/specialUtils";

class Player {
    userId: string;

    constructor(userId: string) {
        this.userId = userId;
    }
}

class PresidentsPlayer extends Player {
    cards: Pile;
    waitingOn: boolean;
    resolveWait?: (value: DiscordCommandEvent) => void;

    constructor(userId: string) {
        super(userId);
        this.cards = new Pile();
        this.waitingOn = false;
    }
}

class Logic {
    bot: BotHooks;
    players: PresidentsPlayer[];

    deck: Deck;
    pile: Pile;
    topSet: CardSet | null;

    gameLoopPromise: Promise<void>;

    constructor(botHooks: BotHooks, playerIds: string[]) {
        this.bot = botHooks;
        this.players = [];

        this.deck = new Deck();
        this.pile = new Pile();
        this.topSet = null;

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
                await this.waitForTurn(player);
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
        })
    }

    private waitForTurn(player: PresidentsPlayer): Promise<DiscordCommandEvent> {
        let promise = new Promise<DiscordCommandEvent>(function (resolve, reject) {
            player.waitingOn = true;
            player.resolveWait = resolve;
        });

        this.bot.sendDM(player.userId, "It's your turn!");

        return promise;
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
        switch(this.alertCanUseInDMsState) {
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