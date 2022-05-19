"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chessPieces_1 = require("./chessPieces");
class CommandParser {
    board;
    static pgnRegex = /([rnbqk])?([a-h])?([1-8])?(x)?([a-h])([1-8])(\+|#|=([rnbq]))?/i;
    static xStrToInt = {
        'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'f': 5, 'g': 6, 'h': 7
    };
    constructor(board) {
        this.board = board;
    }
    parsePGN(str) {
        const match = CommandParser.pgnRegex.exec(str);
        if (!match) {
            return;
        }
        const [fullMatchStr, peiceStr, fromXStr, fromYStr, captureStr, targetXStr, targetYStr, eventStr, promotionStr] = match;
        return {
            piece: chessPieces_1.charToPiece[peiceStr ? peiceStr.toLowerCase() : 'p'],
            targetX: this._xStrToInt(targetXStr),
            targetY: this._yStrToInt(targetYStr),
            fromX: fromXStr ? this._xStrToInt(fromXStr) : undefined,
            fromY: fromYStr ? this._yStrToInt(fromYStr) : undefined,
            capture: Boolean(captureStr),
            check: eventStr === "+",
            checkmate: eventStr === "#",
            promotion: promotionStr ? chessPieces_1.charToPiece[promotionStr.toLowerCase()] : undefined
        };
    }
    tryExec(command) {
        const moveData = this.parsePGN(command);
        if (!moveData) {
            throw new Error("Invalid command");
        }
        const pieces = this.board.getPieces(moveData.piece, this.board.blackTurn);
        const moves = [];
        for (const piece of pieces) {
            if (moveData.fromX && moveData.fromX !== piece.x ||
                moveData.fromY && moveData.fromY !== piece.y) {
                continue;
            }
            const pieceMoves = piece.getValidMoves();
            for (const pieceMove of pieceMoves) {
                if (pieceMove[0] === moveData.targetX && pieceMove[1] === moveData.targetY) {
                    moves.push([piece, pieceMove]);
                }
            }
        }
        if (moves.length > 1) {
            throw new Error("Ambigious move");
        }
        if (moves.length < 1) {
            throw new Error("No legal moves");
        }
        const [movePeice, moveTo] = moves[0];
        this.board.move(movePeice.x, movePeice.y, moveTo[0], moveTo[1]);
    }
    _xStrToInt(xStr) {
        return CommandParser.xStrToInt[xStr.toLowerCase()];
    }
    _yStrToInt(yStr) {
        return parseInt(yStr) - 1;
    }
}
exports.default = CommandParser;
