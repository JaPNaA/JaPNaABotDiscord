import Bot from "../../main/bot/bot/bot";
import Games from "../games";
import Game from "./game";
export declare class Othello extends Game {
    private initer;
    logic: Logic;
    constructor(bot: Bot, parentPlugin: Games, channelId: string, initer: string);
    _start(): void;
    _stop(): void;
}
declare class Logic {
    board: Board;
    place(x: number, y: number): void;
    private canRayTo;
    private flipRayTo;
}
declare class Board {
    darkTurn: boolean;
    private board;
    constructor();
    private setupBoard;
    set(x: number, y: number, disk: Disk): void;
    isOnBoard(x: number, y: number): boolean;
    isEmpty(x: number, y: number): boolean;
    hasPieceOn(x: number, y: number): boolean;
    isPieceOn(x: number, y: number, disk: Disk): boolean;
    toString(): string;
    private diskToString;
}
declare enum Disk {
    dark = 0,
    light = 1,
    none = 2
}
export {};
