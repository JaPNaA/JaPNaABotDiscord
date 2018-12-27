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
    cards: Pile;
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
    players: Player[];
    deck: Deck;
    pile: Pile;
    topSet: CardSet | null;
    constructor(playerIds: string[]);
    init(playerIds: string[]): void;
    initPlayers(playerIds: string[]): void;
    distributeCards(): void;
}
declare class Presidents extends Game {
    _gamePluginName: string;
    _pluginName: string;
    gameName: string;
    channelId: string;
    playerIds: string[];
    logic?: Logic;
    started: boolean;
    constructor(botHooks: BotHooks, parentPlugin: Games, channelId: string);
    join(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    leave(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    start(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    listPlayers(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    _sendStartingMessage(): void;
    _startGameLogic(): void;
    _start(): void;
    _sendAboutMessage(): void;
    _stop(): void;
}
export default Presidents;
