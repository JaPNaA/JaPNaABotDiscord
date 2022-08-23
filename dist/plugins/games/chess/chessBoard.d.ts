import { ChessHistory } from "./chessHistory";
import { Piece, PieceType } from "./chessPieces";
export default class ChessBoard {
    blackTurn: boolean;
    history: ChessHistory;
    private board;
    private captures;
    constructor();
    private setup;
    isOnBoard(x: number, y: number): boolean;
    isEmpty(x: number, y: number): boolean;
    hasPieceOn(x: number, y: number): boolean;
    hasColorPieceOn(x: number, y: number, isBlack: boolean): boolean;
    move(fromX: number, fromY: number, toX: number, toY: number, enPasse?: boolean): void;
    private _moveEnPasseNoCheck;
    private _moveNoCheck;
    undo(): void;
    isCheck(forBlack: boolean): boolean;
    isCheckmate(forBlack: boolean): boolean;
    getPieces(pieceType: PieceType, isBlack: boolean): Piece[];
    getColorPieces(isBlack: boolean): Piece[];
    toString(): string;
}
