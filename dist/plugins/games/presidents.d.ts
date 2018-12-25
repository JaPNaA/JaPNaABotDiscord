import Game from "./game";
import BotHooks from "../../main/bot/botHooks";
import Games from "../games";
import Deck from "./cards/deck";
import Pile from "./cards/pile";
import CardSet from "./cards/cardSet";
import { DiscordCommandEvent } from "../../main/events";
declare class Player {
    userId: string;
    constructor(userId: string);
}
declare class PresidentsPlayer extends Player {
    cards: Pile;
    waitingOn: boolean;
    resolveWait?: (value: DiscordCommandEvent) => void;
    constructor(userId: string);
}
declare class Logic {
    bot: BotHooks;
    players: PresidentsPlayer[];
    deck: Deck;
    pile: Pile;
    topSet: CardSet | null;
    gameLoopPromise: Promise<void>;
    constructor(botHooks: BotHooks, playerIds: string[]);
    onUseCards(event: DiscordCommandEvent, args: string): void;
    private init;
    private initPlayers;
    private distributeCards;
    private gameLoop;
    private sendEveryoneTheirDeck;
    private sendOnesDeck;
    private waitForTurn;
}
declare enum AlertCanUseInDMState {
    notAlerted = 0,
    alerted = 1,
    okThen = 2
}
declare class Presidents extends Game {
    _gamePluginName: string;
    _pluginName: string;
    gameName: string;
    channelId: string;
    playerIds: string[];
    logic?: Logic;
    alertCanUseInDMsState: AlertCanUseInDMState;
    started: boolean;
    constructor(botHooks: BotHooks, parentPlugin: Games, channelId: string, initer: string);
    join(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    _addPlayer(userId: string): {
        hasError: boolean;
        message: string;
    };
    leave(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    start(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    listPlayers(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    _sendStartingMessage(): void;
    _startGameLogic(): void;
    useCards(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    private alertCanUseInDM;
    private alertCanUseInDMFirst;
    private alertCanUseInDMOkThen;
    _start(): void;
    _sendAboutMessage(): void;
    _stop(): void;
}
export default Presidents;
