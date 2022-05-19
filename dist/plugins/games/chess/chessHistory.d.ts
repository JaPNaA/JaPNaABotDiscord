import { Piece, PieceType } from "./chessPieces";
export declare class ChessHistory {
    private moves;
    constructor();
    recordMove(move: MoveData): void;
    popMove(): MoveData | undefined;
    wasChecked(): boolean;
    wasCheckmated(): boolean;
    toString(): string;
    private moveToString;
}
export interface MoveData {
    piece: PieceType;
    targetX: number;
    targetY: number;
    fromX: number;
    fromY: number;
    capture: boolean;
    check: boolean;
    checkmate: boolean;
    promotion?: PieceType;
    capturedPiece?: Piece;
}
