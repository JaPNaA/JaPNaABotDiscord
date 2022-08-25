import ChessBoard from "./chessBoard";

export type PieceType = new (isBlack: boolean, x: number, y: number, board: ChessBoard) => Piece;
/**
 * List of moves.
 * A move consists of an (x: number, y: number) coordinate a piece can move to.
 * If the piece is a Pawn, (x: number, y: number, enPasse: true)
 * represents an en passe.
 */
type MoveList = ([number, number, boolean?])[];

export abstract class Piece {
    public abstract displayCharWhite: string;
    public abstract displayCharBlack: string;

    constructor(public isBlack: boolean,
        public x: number, public y: number,
        protected board: ChessBoard) { }
    public abstract getValidMoves(): MoveList;

    public toString(): string {
        if (this.isBlack) {
            return this.displayCharBlack;
        } else {
            return this.displayCharWhite;
        }
    }

    /**
     * Shoots a ray in a direction, adding possible positions to movesList.
     * First collision blocks movement. Capture move may be added.
     */
    protected movesRay(movesList: MoveList, dirX: number, dirY: number) {
        let currX = this.x + dirX;
        let currY = this.y + dirY;
        while (this.board.isEmpty(currX, currY)) {
            movesList.push([currX, currY]);
            currX += dirX;
            currY += dirY;
        }

        if (this.board.hasColorPieceOn(currX, currY, !this.isBlack)) {
            movesList.push([currX, currY]);
        }

        return movesList;
    }

    /**
     * Adds a move to movesList if the space is empty or an enemy piece
     * is on the spaces. (And doesn't allow capturing own peices, hence, ethical.)
     */
    protected moveIfEthical(movesList: MoveList, x: number, y: number) {
        if (this.board.isEmpty(x, y) || this.board.hasColorPieceOn(x, y, !this.isBlack)) {
            movesList.push([x, y]);
        }
    }
}

export class Pawn extends Piece {
    public displayCharWhite = '\u2659';
    public displayCharBlack = '\u265f';

    public getValidMoves(): MoveList {
        const moves: MoveList = [];

        if (this.isBlack) {
            // advance
            if (this.board.isEmpty(this.x, this.y - 1)) {
                moves.push([this.x, this.y - 1]);
                if (
                    this.y >= 6 &&
                    this.board.isEmpty(this.x, this.y - 2)
                ) {
                    moves.push([this.x, this.y - 2]);
                }
            }
            // capture
            if (this.board.hasColorPieceOn(this.x - 1, this.y - 1, !this.isBlack)) {
                moves.push([this.x - 1, this.y - 1]);
            }
            if (this.board.hasColorPieceOn(this.x + 1, this.y - 1, !this.isBlack)) {
                moves.push([this.x + 1, this.y - 1]);
            }
            // en passe
            const lastMove = this.board.history.getLastMove();
            if (lastMove && !lastMove.isCastle && lastMove.piece === Pawn &&
                lastMove.targetY - lastMove.fromY >= 2 && lastMove.fromY <= 1) {
                if (
                    this.board.hasColorPieceOn(this.x - 1, this.y, !this.isBlack) &&
                    lastMove.fromX == this.x - 1
                ) {
                    moves.push([this.x - 1, this.y - 1, true]);
                }
                if (
                    this.board.hasColorPieceOn(this.x + 1, this.y, !this.isBlack) &&
                    lastMove.fromX == this.x + 1
                ) {
                    moves.push([this.x + 1, this.y - 1, true]);
                }
            }
        } else {
            // advance
            if (this.board.isEmpty(this.x, this.y + 1)) {
                moves.push([this.x, this.y + 1]);
                if (
                    this.y <= 1 &&
                    this.board.isEmpty(this.x, this.y + 2)
                ) {
                    moves.push([this.x, this.y + 2]);
                }
            }
            // capture
            if (this.board.hasColorPieceOn(this.x - 1, this.y + 1, !this.isBlack)) {
                moves.push([this.x - 1, this.y + 1]);
            }
            if (this.board.hasColorPieceOn(this.x + 1, this.y + 1, !this.isBlack)) {
                moves.push([this.x + 1, this.y + 1]);
            }
            // en passe
            const lastMove = this.board.history.getLastMove();
            if (lastMove && !lastMove.isCastle && lastMove.piece === Pawn &&
                lastMove.targetY - lastMove.fromY <= -2 && lastMove.fromY >= 6) {
                if (
                    this.board.hasColorPieceOn(this.x - 1, this.y, !this.isBlack) &&
                    lastMove.fromX == this.x - 1
                ) {
                    moves.push([this.x - 1, this.y + 1, true]);
                }
                if (
                    this.board.hasColorPieceOn(this.x + 1, this.y, !this.isBlack) &&
                    lastMove.fromX == this.x + 1
                ) {
                    moves.push([this.x + 1, this.y + 1, true]);
                }
            }
        }

        return moves;
    }
}

export class Rook extends Piece {
    public displayCharWhite = '\u2656';
    public displayCharBlack = '\u265C';

    public getValidMoves(): MoveList {
        const moves: MoveList = [];
        this.movesRay(moves, 1, 0);
        this.movesRay(moves, 0, 1);
        this.movesRay(moves, -1, 0);
        this.movesRay(moves, 0, -1);
        return moves;
    }
}

export class Knight extends Piece {
    public displayCharWhite = '\u2658';
    public displayCharBlack = '\u265E';

    public getValidMoves(): MoveList {
        const moves: MoveList = [];
        this.moveIfEthical(moves, this.x + 2, this.y + 1);
        this.moveIfEthical(moves, this.x + 1, this.y + 2);
        this.moveIfEthical(moves, this.x - 1, this.y + 2);
        this.moveIfEthical(moves, this.x - 2, this.y + 1);
        this.moveIfEthical(moves, this.x - 2, this.y - 1);
        this.moveIfEthical(moves, this.x - 1, this.y - 2);
        this.moveIfEthical(moves, this.x + 1, this.y - 2);
        this.moveIfEthical(moves, this.x + 2, this.y - 1);
        return moves;
    }
}

export class Bishop extends Piece {
    public displayCharWhite = '\u2657';
    public displayCharBlack = '\u265D';

    public getValidMoves(): MoveList {
        const moves: MoveList = [];
        this.movesRay(moves, 1, 1);
        this.movesRay(moves, -1, 1);
        this.movesRay(moves, -1, -1);
        this.movesRay(moves, 1, -1);
        return moves;
    }
}

export class Queen extends Piece {
    public displayCharWhite = '\u2655';
    public displayCharBlack = '\u265B';

    public getValidMoves(): MoveList {
        const moves: MoveList = [];
        // horizontals
        this.movesRay(moves, 1, 0);
        this.movesRay(moves, 0, 1);
        this.movesRay(moves, -1, 0);
        this.movesRay(moves, 0, -1);
        // diagonals
        this.movesRay(moves, 1, 1);
        this.movesRay(moves, -1, 1);
        this.movesRay(moves, -1, -1);
        this.movesRay(moves, 1, -1);
        return moves;
    }
}

export class King extends Piece {
    public displayCharWhite = '\u2654';
    public displayCharBlack = '\u265A';

    public getValidMoves(): MoveList {
        const moves: MoveList = [];
        this.moveIfEthical(moves, this.x + 1, this.y);
        this.moveIfEthical(moves, this.x + 1, this.y + 1);
        this.moveIfEthical(moves, this.x, this.y + 1);
        this.moveIfEthical(moves, this.x - 1, this.y + 1);
        this.moveIfEthical(moves, this.x - 1, this.y);
        this.moveIfEthical(moves, this.x - 1, this.y - 1);
        this.moveIfEthical(moves, this.x, this.y - 1);
        this.moveIfEthical(moves, this.x + 1, this.y - 1);
        return moves;
    }
}

export const charToPiece: { [x: string]: PieceType } = {
    'p': Pawn,
    'r': Rook,
    'n': Knight,
    'b': Bishop,
    'q': Queen,
    'k': King
};

export const pieceToPGNChar = new Map<PieceType, string>([
    [Pawn, ''],
    [Rook, 'R'],
    [Knight, 'N'],
    [Bishop, 'B'],
    [Queen, 'Q'],
    [King, 'K']
]);
