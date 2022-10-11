import Bot from "../../main/bot/bot/bot";
import DiscordCommandEvent from "../../main/bot/events/discordCommandEvent";
import Games from "../games";
import Game from "./game";
import Lobby from "./utils/lobby";
export declare class Othello extends Game {
    private initer;
    lobby: Lobby;
    logic: Logic;
    players?: string[];
    started: boolean;
    constructor(bot: Bot, parentPlugin: Games, channelId: string, initer: string);
    exec(event: DiscordCommandEvent): Generator<string, string | undefined, unknown>;
    private getTurnUser;
    private checkGameEnd;
    _start(): Promise<void>;
    _stop(): void;
}
declare class Logic {
    board: Board;
    place(x: number, y: number): void;
    getMoveFlipDirections(x: number, y: number): [number, number][];
    hasValidMoves(): boolean;
    private canRayTo;
    private flipRayTo;
}
declare class Board {
    darkTurn: boolean;
    static readonly WIDTH = 8;
    static readonly HEIGHT = 8;
    private board;
    constructor();
    private setupBoard;
    set(x: number, y: number, disk: Disk): void;
    isOnBoard(x: number, y: number): boolean;
    isEmpty(x: number, y: number): boolean;
    hasPieceOn(x: number, y: number): boolean;
    isPieceOn(x: number, y: number, disk: Disk): boolean;
    countDisks(disk: Disk): number;
    toString(): string;
    private diskToString;
}
declare enum Disk {
    dark = 0,
    light = 1,
    none = 2
}
export {};
