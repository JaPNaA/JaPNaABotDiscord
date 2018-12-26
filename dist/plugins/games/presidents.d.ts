import Game from "./game";
import BotHooks from "../../main/bot/botHooks";
import Games from "../games";
import Deck from "./cards/deck";
import CardsList from "./cards/cardList";
import { DiscordCommandEvent } from "../../main/events";
import { Rank } from "./cards/cardUtils";
import { Card, NormalCard } from "./cards/card";
import Pile from "./cards/pile";
import { Message } from "discord.js";
declare class Player {
    userId: string;
    constructor(userId: string);
}
declare class PresidentsPlayer extends Player {
    cards: CardsList;
    waitingOn: boolean;
    resolveWait?: (value: DiscordCommandEvent) => void;
    constructor(userId: string);
    countJokers(): number;
    count(rank: Rank): number;
    has(rank: Rank, amount: number): boolean;
    hasJokers(amount: number): boolean;
    use(rank: Rank, amount: number): Card[];
    useJoker(amount: number): Card[];
    private useCards;
    separateBurnAndNormalCards(): {
        burnCards: Card[];
        normalCards: NormalCard[];
    };
}
declare class Logic {
    bot: BotHooks;
    channelId: string;
    players: PresidentsPlayer[];
    deck: Deck;
    pile: Pile;
    pileMessage?: Message;
    gameLoopPromise: Promise<void>;
    constructor(botHooks: BotHooks, channelId: string, playerIds: string[]);
    onUseCards(event: DiscordCommandEvent, args: string): void;
    private init;
    private initPlayers;
    private distributeCards;
    private gameLoop;
    private sendEveryoneTheirDeck;
    private sendOnesDeck;
    private waitForValidTurn;
    private waitForTurn;
    private tryParseAndDoAction;
    private parseAction;
    private tryDoAction;
    private tryActionEndGame;
    private tryEndGameWithBurnCards;
    private tryActionBurn;
    private tryActionRun;
    private tryPlayCard;
    private playerUseSet;
    private sendPile;
    private updatePile;
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
