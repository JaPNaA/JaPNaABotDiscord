import { King, Piece, PieceType, Rook } from "./chessPieces";

export class ChessHistory {
    private moves: MoveData[] = [];

    constructor() { }

    public recordMove(move: MoveData) {
        this.moves.push(move);
    }

    public popMove() {
        return this.moves.pop();
    }

    public getLastMove() {
        return this.moves[this.moves.length - 1];
    }

    public hasKingMoved(isBlack: boolean) {
        for (let i = isBlack ? 1 : 0; i < this.moves.length; i += 2) {
            const move = this.moves[i];
            if (move.isCastle) {
                return true;
            } else if (move.piece === King) {
                return true;
            }
        }
        return false;
    }

    /**
     * This method will return true (even incorrectly) if the side castles.
     * Should be fine for one-king (normal) games. Method intended for
     * castle condition checking.
     */
    public hasRookMoved(isBlack: boolean, x: number, y: number) {
        for (let i = isBlack ? 1 : 0; i < this.moves.length; i += 2) {
            const move = this.moves[i];
            if (move.isCastle) {
                return true;
            } else if (move.piece === Rook && move.fromX === x && move.fromY === y) {
                return true;
            }
        }
        return false;
    }

    public wasChecked() {
        if (this.moves.length <= 0) { return false; }
        return this.getLastMove().check;
    }

    public wasCheckmated() {
        if (this.moves.length <= 0) { return false; }
        return this.getLastMove().checkmate;
    }

    public toString(): string {
        const str: string[] = [];

        let isBlackMove = false;
        let moveNumber = 1;
        for (const move of this.moves) {
            const moveStr = this.moveToString(move);
            if (isBlackMove) {
                str.push(moveStr + "\n");
            } else {
                str.push((moveNumber++) + ". " + moveStr + " ");
            }
        }

        return str.join("");
    }

    private moveToString(move: MoveData): string {
        if (move.isCastle) {
            return move.queenSide ? "O-O-O" : "O-O";
        }

        return String.fromCharCode('a'.charCodeAt(0) + move.fromX) +
            (move.fromY + 1) + move.piece.name +
            (move.capture ? "x" : "") +
            String.fromCharCode('a'.charCodeAt(0) + move.targetX) +
            (move.targetY + 1) +
            (move.promotion ? "=" + move.promotion.name : "") +
            (move.checkmate ? "#" : (
                move.check ? "+" : ""
            ));
    }
}

export type MoveData = NormalMoveData | CastleMoveData;

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

    fromKingX: number;
    fromKingY: number;
    toKingX: number;
    toKingY: number;

    fromRookX: number;
    fromRookY: number;
    toRookX: number;
    toRookY: number;
}
