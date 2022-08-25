import ChessBoard from "./chessBoard";
export declare type PieceType = new (isBlack: boolean, x: number, y: number, board: ChessBoard) => Piece;
/**
 * List of moves.
 * A move consists of an (x: number, y: number) coordinate a piece can move to.
 * If the piece is a Pawn, (x: number, y: number, enPasse: true)
 * represents an en passe.
 */
declare type MoveList = ([number, number, boolean?])[];
export declare abstract class Piece {
    isBlack: boolean;
    x: number;
    y: number;
    protected board: ChessBoard;
    abstract displayCharWhite: string;
    abstract displayCharBlack: string;
    constructor(isBlack: boolean, x: number, y: number, board: ChessBoard);
    abstract getValidMoves(): MoveList;
    toString(): string;
    /**
     * Shoots a ray in a direction, adding possible positions to movesList.
     * First collision blocks movement. Capture move may be added.
     */
    protected movesRay(movesList: MoveList, dirX: number, dirY: number): MoveList;
    /**
     * Adds a move to movesList if the space is empty or an enemy piece
     * is on the spaces. (And doesn't allow capturing own peices, hence, ethical.)
     */
    protected moveIfEthical(movesList: MoveList, x: number, y: number): void;
}
export declare class Pawn extends Piece {
    displayCharWhite: string;
    displayCharBlack: string;
    getValidMoves(): MoveList;
}
export declare class Rook extends Piece {
    displayCharWhite: string;
    displayCharBlack: string;
    getValidMoves(): MoveList;
}
export declare class Knight extends Piece {
    displayCharWhite: string;
    displayCharBlack: string;
    getValidMoves(): MoveList;
}
export declare class Bishop extends Piece {
    displayCharWhite: string;
    displayCharBlack: string;
    getValidMoves(): MoveList;
}
export declare class Queen extends Piece {
    displayCharWhite: string;
    displayCharBlack: string;
    getValidMoves(): MoveList;
}
export declare class King extends Piece {
    displayCharWhite: string;
    displayCharBlack: string;
    getValidMoves(): MoveList;
}
export declare const charToPiece: {
    [x: string]: PieceType;
};
export declare const pieceToPGNChar: Map<PieceType, string>;
export {};
