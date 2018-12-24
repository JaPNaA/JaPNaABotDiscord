/// <reference types="node" />
import Deck from "./cards/deck";
import Game from "../games/game";
import BotHooks from "../../main/bot/botHooks";
import { Message } from "discord.js";
import { Rank } from "./cards/cardTypes";
import { DiscordCommandEvent } from "../../main/events";
declare class SlapJack extends Game {
    _pluginName: string;
    channelId: string;
    activeMessage?: Message;
    speedMilli: number;
    timeoutId?: NodeJS.Timeout;
    deck: Deck;
    jack: Rank;
    acceptingSlaps: boolean;
    constructor(botHooks: BotHooks, channelId: string);
    _start(): void;
    onReadyStart(): void;
    slap(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    tick(): void;
    startTicking(): void;
    stopTicking(): void;
    _stop(): void;
}
export default SlapJack;
