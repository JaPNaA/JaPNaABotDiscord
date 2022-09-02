/// <reference types="node" />
import Deck from "./utils/cards/deck";
import Game from "../games/game";
import Bot from "../../main/bot/bot/bot";
import { Message } from "discord.js";
import { Rank } from "./utils/cards/cardUtils";
import DiscordCommandEvent from "../../main/bot/events/discordCommandEvent";
import Games from "../games";
declare class SlapJack extends Game {
    _gamePluginName: string;
    pluginName: string;
    gameName: string;
    channelId: string;
    activeMessage?: Message;
    speedMilli: number;
    timeoutId?: NodeJS.Timeout;
    deck: Deck;
    jack: Rank;
    acceptingSlaps: boolean;
    jackedTime: number;
    gameEnded: boolean;
    constructor(botHooks: Bot, parentPlugin: Games, channelId: string);
    _start(): void;
    onReadyStart(): void;
    slap(event: DiscordCommandEvent): Generator<string, "you slapped too early! violent!!" | undefined, unknown>;
    tick(): void;
    jacked(editPromise: Promise<any>): void;
    startTicking(): void;
    stopTicking(): void;
    _stop(): void;
}
export default SlapJack;
