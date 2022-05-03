"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chessPieces_1 = require("./chessPieces");
class ChessBoard {
    blackTurn = false;
    board;
    captures = [];
    constructor() {
        this.board = [];
        for (let y = 0; y < 8; y++) {
            const row = [];
            for (let x = 0; x < 8; x++) {
                row.push(null);
            }
            this.board.push(row);
        }
        this.setup(standardSetup);
    }
    setup(setup) {
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const char = setup[7 - y][x]; // read setup backwards (setup is backwards)
                const lowercase = char.toLowerCase();
                const pieceType = chessPieces_1.charToPiece[lowercase];
                let piece = null;
                if (pieceType) {
                    piece = new pieceType(lowercase !== char, x, y, this);
                }
                this.board[y][x] = piece;
            }
        }
    }
    isOnBoard(x, y) {
        return x >= 0 && x < 8 && y >= 0 && y < 8;
    }
    isEmpty(x, y) {
        return this.isOnBoard(x, y) && this.board[y][x] === null;
    }
    hasPieceOn(x, y) {
        return this.isOnBoard(x, y) && this.board[y][x] !== null;
    }
    hasColorPieceOn(x, y, isBlack) {
        if (!this.isOnBoard(x, y)) {
            return false;
        }
        const piece = this.board[y][x];
        return piece !== null && piece.isBlack === isBlack;
    }
    move(fromX, fromY, toX, toY) {
        const piece = this.board[fromY][fromX];
        if (piece === null) {
            throw new Error(`No piece on (${fromX}, ${fromY}).`);
        }
        this.board[fromY][fromX] = null;
        const targetPos = this.board[toY][toX];
        if (targetPos !== null) {
            this.captures.push(targetPos);
        }
        this.board[toY][toX] = piece;
        piece.x = toX;
        piece.y = toY;
    }
    getPieces(pieceType, isBlack) {
        const pieces = [];
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = this.board[y][x];
                if (piece instanceof pieceType && piece.isBlack === isBlack) {
                    pieces.push(piece);
                }
            }
        }
        return pieces;
    }
    toString() {
        let str = [];
        for (let y = 7; y >= 0; y--) {
            let row = (y + 1) + "  ";
            for (let x = 0; x < 8; x++) {
                const piece = this.board[y][x];
                row += (piece ? piece.toString() : '\u00b7') + ' ';
            }
            str.push(row);
        }
        str.push("   a b c d e f g h");
        str.push("\n" + (this.blackTurn ? "black" : "white") + "'s turn");
        return str.join("\n");
    }
}
exports.default = ChessBoard;
const standardSetup = [
    "RNBQKBNR",
    "PPPPPPPP",
    "        ",
    "        ",
    "        ",
    "        ",
    "pppppppp",
    "rnbqkbnr"
];
