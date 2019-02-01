/// <reference types="node" />
import Deck from "./cards/deck";
import Game from "../games/game";
import BotHooks from "../../main/bot/bot/botHooks";
import { Message } from "discord.js";
import { Rank } from "./cards/cardUtils";
import DiscordCommandEvent from "../../main/bot/types/discordCommandEvent";
import Games from "../games";
declare class SlapJack extends Game {
    _gamePluginName: string;
    _pluginName: string;
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
    constructor(botHooks: BotHooks, parentPlugin: Games, channelId: string);
    _start(): void;
    onReadyStart(): void;
    slap(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    tick(): void;
    jacked(editPromise: Promise<any>): void;
    startTicking(): void;
    stopTicking(): void;
    _stop(): void;
}
export default SlapJack;
