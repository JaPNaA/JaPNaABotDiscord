"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChessHistory = void 0;
const chessPieces_1 = require("./chessPieces");
class ChessHistory {
    moves = [];
    constructor() { }
    recordMove(move) {
        this.moves.push(move);
    }
    popMove() {
        return this.moves.pop();
    }
    getLastMove() {
        return this.moves[this.moves.length - 1];
    }
    hasKingMoved(isBlack) {
        for (let i = isBlack ? 1 : 0; i < this.moves.length; i += 2) {
            const move = this.moves[i];
            if (move.isCastle) {
                return true;
            }
            else if (move.piece === chessPieces_1.King) {
                return true;
            }
        }
        return false;
    }
    wasChecked() {
        if (this.moves.length <= 0) {
            return false;
        }
        return this.getLastMove().check;
    }
    wasCheckmated() {
        if (this.moves.length <= 0) {
            return false;
        }
        return this.getLastMove().checkmate;
    }
    toString() {
        const str = [];
        let isBlackMove = false;
        let moveNumber = 1;
        for (const move of this.moves) {
            const moveStr = this.moveToString(move);
            if (isBlackMove) {
                str.push(moveStr + "\n");
            }
            else {
                str.push((moveNumber++) + ". " + moveStr + " ");
            }
        }
        return str.join("");
    }
    moveToString(move) {
        if (move.isCastle) {
            return move.queenSide ? "O-O-O" : "O-O";
        }
        return String.fromCharCode('a'.charCodeAt(0) + move.fromX) +
            (move.fromY + 1) + move.piece.name +
            (move.capture ? "x" : "") +
            String.fromCharCode('a'.charCodeAt(0) + move.targetX) +
            (move.targetY + 1) +
            (move.promotion ? "=" + move.promotion.name : "") +
            (move.checkmate ? "#" : (move.check ? "+" : ""));
    }
}
exports.ChessHistory = ChessHistory;
