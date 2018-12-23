/// <reference types="node" />
import Deck from "./cards/deck";
import Game from "../games/game";
import BotHooks from "../../main/bot/botHooks";
import { Message } from "discord.js";
import { Rank } from "./cards/cardTypes";
declare class SlapJack extends Game {
    channelId: string;
    activeMessage?: Message;
    speedMilli: number;
    timeoutId?: NodeJS.Timeout;
    deck: Deck;
    jack: Rank;
    constructor(botHooks: BotHooks, channelId: string);
    _start(): void;
    onReadyStart(): void;
    tick(): void;
    startTicking(): void;
    stopTicking(): void;
    _stop(): void;
}
export default SlapJack;
