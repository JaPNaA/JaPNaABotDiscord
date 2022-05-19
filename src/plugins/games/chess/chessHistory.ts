import { Piece, PieceType } from "./chessPieces";

export class ChessHistory {
    private moves: MoveData[] = [];

    constructor() { }

    public recordMove(move: MoveData) {
        this.moves.push(move);
    }

    public popMove() {
        return this.moves.pop();
    }

    public wasChecked() {
        if (this.moves.length <= 0) { return false; }
        return this.moves[this.moves.length - 1].check;
    }

    public wasCheckmated() {
        if (this.moves.length <= 0) { return false; }
        return this.moves[this.moves.length - 1].checkmate;
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
