import Game from "./game";
import BotHooks from "../../main/bot/botHooks";
import Games from "../games";
import Deck from "./cards/deck";
import Pile from "./cards/pile";
import CardSet from "./cards/cardSet";
import { DiscordCommandEvent } from "../../main/events";
declare class Player {
    userId: string;
    cards: Pile;
    constructor(userId: string);
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
