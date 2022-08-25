"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pieceToPGNChar = exports.charToPiece = exports.King = exports.Queen = exports.Bishop = exports.Knight = exports.Rook = exports.Pawn = exports.Piece = void 0;
class Piece {
    isBlack;
    x;
    y;
    board;
    constructor(isBlack, x, y, board) {
        this.isBlack = isBlack;
        this.x = x;
        this.y = y;
        this.board = board;
    }
    toString() {
        if (this.isBlack) {
            return this.displayCharBlack;
        }
        else {
            return this.displayCharWhite;
        }
    }
    /**
     * Shoots a ray in a direction, adding possible positions to movesList.
     * First collision blocks movement. Capture move may be added.
     */
    movesRay(movesList, dirX, dirY) {
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
    moveIfEthical(movesList, x, y) {
        if (this.board.isEmpty(x, y) || this.board.hasColorPieceOn(x, y, !this.isBlack)) {
            movesList.push([x, y]);
        }
    }
}
exports.Piece = Piece;
class Pawn extends Piece {
    displayCharWhite = '\u2659';
    displayCharBlack = '\u265f';
    getValidMoves() {
        const moves = [];
        if (this.isBlack) {
            // advance
            if (this.board.isEmpty(this.x, this.y - 1)) {
                moves.push([this.x, this.y - 1]);
                if (this.y >= 6 &&
                    this.board.isEmpty(this.x, this.y - 2)) {
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
                if (this.board.hasColorPieceOn(this.x - 1, this.y, !this.isBlack) &&
                    lastMove.fromX == this.x - 1) {
                    moves.push([this.x - 1, this.y - 1, true]);
                }
                if (this.board.hasColorPieceOn(this.x + 1, this.y, !this.isBlack) &&
                    lastMove.fromX == this.x + 1) {
                    moves.push([this.x + 1, this.y - 1, true]);
                }
            }
        }
        else {
            // advance
            if (this.board.isEmpty(this.x, this.y + 1)) {
                moves.push([this.x, this.y + 1]);
                if (this.y <= 1 &&
                    this.board.isEmpty(this.x, this.y + 2)) {
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
                if (this.board.hasColorPieceOn(this.x - 1, this.y, !this.isBlack) &&
                    lastMove.fromX == this.x - 1) {
                    moves.push([this.x - 1, this.y + 1, true]);
                }
                if (this.board.hasColorPieceOn(this.x + 1, this.y, !this.isBlack) &&
                    lastMove.fromX == this.x + 1) {
                    moves.push([this.x + 1, this.y + 1, true]);
                }
            }
        }
        return moves;
    }
}
exports.Pawn = Pawn;
class Rook extends Piece {
    displayCharWhite = '\u2656';
    displayCharBlack = '\u265C';
    getValidMoves() {
        const moves = [];
        this.movesRay(moves, 1, 0);
        this.movesRay(moves, 0, 1);
        this.movesRay(moves, -1, 0);
        this.movesRay(moves, 0, -1);
        return moves;
    }
}
exports.Rook = Rook;
class Knight extends Piece {
    displayCharWhite = '\u2658';
    displayCharBlack = '\u265E';
    getValidMoves() {
        const moves = [];
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
exports.Knight = Knight;
class Bishop extends Piece {
    displayCharWhite = '\u2657';
    displayCharBlack = '\u265D';
    getValidMoves() {
        const moves = [];
        this.movesRay(moves, 1, 1);
        this.movesRay(moves, -1, 1);
        this.movesRay(moves, -1, -1);
        this.movesRay(moves, 1, -1);
        return moves;
    }
}
exports.Bishop = Bishop;
class Queen extends Piece {
    displayCharWhite = '\u2655';
    displayCharBlack = '\u265B';
    getValidMoves() {
        const moves = [];
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
exports.Queen = Queen;
class King extends Piece {
    displayCharWhite = '\u2654';
    displayCharBlack = '\u265A';
    getValidMoves() {
        const moves = [];
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
exports.King = King;
exports.charToPiece = {
    'p': Pawn,
    'r': Rook,
    'n': Knight,
    'b': Bishop,
    'q': Queen,
    'k': King
};
exports.pieceToPGNChar = new Map([
    [Pawn, ''],
    [Rook, 'R'],
    [Knight, 'N'],
    [Bishop, 'B'],
    [Queen, 'Q'],
    [King, 'K']
]);
