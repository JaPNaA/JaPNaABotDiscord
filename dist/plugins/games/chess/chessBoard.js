"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chessHistory_1 = require("./chessHistory");
const chessPieces_1 = require("./chessPieces");
class ChessBoard {
    blackTurn = false;
    history = new chessHistory_1.ChessHistory();
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
        const historyRecord = this._moveNoCheck(fromX, fromY, toX, toY);
        // blackTurn has already been flipped in _moveNoCheck
        if (this.isCheck(!this.blackTurn)) {
            this.undo();
            throw new Error("King in check");
        }
        historyRecord.check = this.isCheck(this.blackTurn);
        historyRecord.checkmate = this.isCheckmate(this.blackTurn);
    }
    _moveNoCheck(fromX, fromY, toX, toY) {
        const piece = this.board[fromY][fromX];
        if (piece === null) {
            throw new Error(`No piece on (${fromX}, ${fromY}).`);
        }
        this.board[fromY][fromX] = null;
        const targetPosPiece = this.board[toY][toX];
        if (targetPosPiece !== null) {
            this.captures.push(targetPosPiece);
        }
        this.board[toY][toX] = piece;
        piece.x = toX;
        piece.y = toY;
        const historyRecord = {
            piece: piece.constructor,
            targetX: toX,
            targetY: toY,
            fromX: fromX,
            fromY: fromY,
            capture: targetPosPiece !== null,
            capturedPiece: targetPosPiece ? targetPosPiece : undefined,
            check: false,
            checkmate: false
        };
        this.history.recordMove(historyRecord);
        this.blackTurn = !this.blackTurn;
        return historyRecord;
    }
    undo() {
        const move = this.history.popMove();
        if (!move) {
            return;
        }
        const piece = this.board[move.targetY][move.targetX];
        if (piece === null) {
            throw new Error(`No piece on (${move.targetX}, ${move.targetY}).`);
        }
        this.board[move.targetY][move.targetX] = null;
        const targetPosPiece = this.board[move.fromY][move.fromX];
        if (targetPosPiece !== null) {
            throw new Error(`Piece already on (${move.fromX}, ${move.fromY})`);
        }
        this.board[move.fromY][move.fromX] = piece;
        piece.x = move.fromX;
        piece.y = move.fromY;
        if (move.capture) {
            if (!move.capturedPiece) {
                throw new Error("Undoing corrupted move");
            }
            this.board[move.targetY][move.targetX] = move.capturedPiece;
            move.capturedPiece.x = move.targetX;
            move.capturedPiece.y = move.targetY;
        }
        this.blackTurn = !this.blackTurn;
    }
    isCheck(forBlack) {
        const kings = this.getPieces(chessPieces_1.King, forBlack);
        if (kings.length != 1) {
            return false;
        }
        const king = kings[0];
        const opponentPieces = this.getColorPieces(!forBlack);
        for (const opponentPiece of opponentPieces) {
            for (const possibleMove of opponentPiece.getValidMoves()) {
                if (possibleMove[0] === king.x && possibleMove[1] === king.y) {
                    return true;
                }
            }
        }
        return false;
    }
    isCheckmate(forBlack) {
        const pieces = this.getColorPieces(forBlack);
        for (const piece of pieces) {
            for (const possibleMove of piece.getValidMoves()) {
                this._moveNoCheck(piece.x, piece.y, possibleMove[0], possibleMove[1]);
                if (!this.isCheck(forBlack)) {
                    this.undo();
                    return false;
                }
                this.undo();
            }
        }
        return true;
    }
    getPieces(pieceType, isBlack) {
        return this.getColorPieces(isBlack).filter(piece => piece instanceof pieceType);
    }
    getColorPieces(isBlack) {
        const pieces = [];
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = this.board[y][x];
                if (piece !== null && piece.isBlack === isBlack) {
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
        if (this.history.wasCheckmated()) {
            str.push("\n" + "Checkmate; " + (this.blackTurn ? "white" : "black") + " wins!");
        }
        else {
            str.push("\n" + (this.blackTurn ? "black" : "white") + "'s turn");
        }
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
