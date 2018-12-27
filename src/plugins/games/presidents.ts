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
import { Message } from "discord.js";
import { toOne } from "../../main/utils";

class Player {
    userId: string;
    cards: Pile;

    constructor(userId: string) {
        this.userId = userId;
        this.cards = new Pile();
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
    players: Player[];

    deck: Deck;
    pile: Pile;

    pileMessage?: Message;

    constructor(playerIds: string[]) {
        this.players = [];

        this.deck = new Deck();
        this.pile = new Pile();

        this.init(playerIds);
    }

    init(playerIds: string[]) {
        this.deck.shuffle();
        this.initPlayers(playerIds);
    }

    initPlayers(playerIds: string[]) {
        for (let playerId of playerIds) {
            this.players.push(new Player(playerId));
        }
    }

    distributeCards() {
        let numPlayers = this.players.length;
        let numCards = this.deck.cards.length;
        let cardsPerPlayer = Math.floor(numCards / numPlayers);

        for (let player of this.players) {
            for (let i: number = 0; i < cardsPerPlayer; i++) {
                let card = this.deck.takeTop();
                if (!card) { throw new Error("Unknown Error"); }
                player.cards.add(card);
            }

            player.cards.sortByRank();
        }
    }
}

class Presidents extends Game {
    _gamePluginName: string = "presidents";
    _pluginName: string = "game." + this._gamePluginName;
    gameName: string = "Presidents";

    channelId: string;
    playerIds: string[];

    logic?: Logic;

    started: boolean;

    constructor(botHooks: BotHooks, parentPlugin: Games, channelId: string) {
        super(botHooks, parentPlugin);

        this.channelId = channelId;
        this.playerIds = [];

        this.started = false;
    }

    join(bot: BotHooks, event: DiscordCommandEvent, args: string) {
        let userId = event.userId;
        this.playerIds.push(userId);
        bot.send(event.channelId, mention(userId) + ` has joined ${this.gameName}!`);
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
        const fields: object[] = [];
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

export default Presidents;