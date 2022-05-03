import { Piece, PieceType } from "./chessPieces";
export default class ChessBoard {
    blackTurn: boolean;
    private board;
    private captures;
    constructor();
    private setup;
    isOnBoard(x: number, y: number): boolean;
    isEmpty(x: number, y: number): boolean;
    hasPieceOn(x: number, y: number): boolean;
    hasColorPieceOn(x: number, y: number, isBlack: boolean): boolean;
    move(fromX: number, fromY: number, toX: number, toY: number): void;
    getPieces(pieceType: PieceType, isBlack: boolean): Piece[];
    toString(): string;
}
