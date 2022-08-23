import { Piece, PieceType } from "./chessPieces";
export declare class ChessHistory {
    private moves;
    constructor();
    recordMove(move: MoveData): void;
    popMove(): MoveData | undefined;
    getLastMove(): MoveData;
    hasKingMoved(isBlack: boolean): boolean;
    wasChecked(): boolean;
    wasCheckmated(): boolean;
    toString(): string;
    private moveToString;
}
export declare type MoveData = NormalMoveData | CastleMoveData;
interface _MoveData {
    isCastle: boolean;
    check: boolean;
    checkmate: boolean;
}
export interface NormalMoveData extends _MoveData {
    piece: PieceType;
    targetX: number;
    targetY: number;
    fromX: number;
    fromY: number;
    capture: boolean;
    enPasse: boolean;
    isCastle: false;
    promotion?: PieceType;
    capturedPiece?: Piece;
}
export interface CastleMoveData extends _MoveData {
    isCastle: true;
    queenSide: boolean;
}
export {};
