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
    cards: Pile;

    constructor(userId: string) {
        this.userId = userId;
        this.cards = new Pile();
    }
}

class Presidents extends Game {
    _gamePluginName: string = "presidents";
    _pluginName: string = "game." + this._gamePluginName;
    gameName: string = "Presidents";

    channelId: string;

    playerIds: string[];
    players: Player[];

    deck: Deck;
    pile: Pile;
    topSet: CardSet | null;

    started: boolean;

    constructor(botHooks: BotHooks, parentPlugin: Games, channelId: string) {
        super(botHooks, parentPlugin);

        this.channelId = channelId;

        this.playerIds = [];
        this.players = [];

        this.deck = new Deck();
        this.pile = new Pile();
        this.topSet = null;

        this.started = false;
    }

    join(bot: BotHooks, event: DiscordCommandEvent, args: string) {
        let userId = event.userId;
        this.playerIds.push(userId);
        bot.send(event.channelId, mention(userId) +` has joined ${this.gameName}!`);
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

        this.deck.shuffle();
        this._initPlayers();
        this._distributeCards();
    }

    listPlayers(bot: BotHooks, event: DiscordCommandEvent, args: string) {
        bot.send(event.channelId, 
            this.playerIds.map(e => mention(e)).join(", ") + " (" + this.playerIds.length + ")"
        );
    }

    _sendStartingMessage() {
        let players: string[] = [];
        for (let playerId of this.playerIds) {
            players.push(mention(playerId));
        }
        this.bot.send(this.channelId, "Starting Presidents with players:\n" + players.join(", "));
    }

    _initPlayers() {
        for (let playerId of this.playerIds) {
            this.players.push(new Player(playerId));
        }
    }

    _distributeCards() {
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
                "and you can leave by typing `" + precommmand + "leave`\n" +
                "There can be ### players\n" +
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