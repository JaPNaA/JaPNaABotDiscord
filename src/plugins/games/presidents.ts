import Game from "./game";
import BotHooks from "../../main/bot/botHooks";
import Games from "../games";
import Deck from "./cards/deck";
import Pile from "./cards/pile";
import CardSet from "./cards/cardSet";
import { DiscordCommandEvent } from "../../main/events";

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
        bot.send(event.channelId, `<@${userId}> has joined ${this.gameName}!`);
    }

    leave(bot: BotHooks, event: DiscordCommandEvent, args: string) {
        let userId = event.userId;
        let index = this.playerIds.indexOf(userId);

        this.playerIds.splice(index, 1);

        if (index < 0) {
            bot.send(event.channelId, `<@${userId}>, you were never in the game!`);
        } else {
            bot.send(event.channelId, `<@${userId}> has left the game`);
        }
    }

    start(bot: BotHooks, event: DiscordCommandEvent, args: string) {
        this.started = true;

        this._sendStartingMessage();

        this.deck.shuffle();
        this._initPlayers();
        this._distributeCards();
    }

    _sendStartingMessage() {
        let players: string[] = [];
        for (let playerId of this.playerIds) {
            players.push(`<@${playerId}>`);
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

    debug_showCards(bot: BotHooks, event: DiscordCommandEvent, args: string) {
        let user = this.players.find(e => e.userId === event.userId);
        if (!user) return;

        let str = "";
        
        for (let card of user.cards) {
            str += card.toSymbol();
        }
        
        bot.send(event.channelId, str);
    }

    _start() {
        this._registerCommand(this.commandManager, "join", this.join);
        this._registerCommand(this.commandManager, "leave", this.leave);
        this._registerCommand(this.commandManager, "start", this.start);
        this._registerCommand(this.commandManager, "debug:showCards", this.debug_showCards);
        
        this.bot.send(this.channelId, "starting presidents");
    }

    _stop() {
        // do nothing
    }
}

export default Presidents;