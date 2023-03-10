"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chessPieces_1 = require("./chessPieces");
const errors_1 = require("./errors");
class CommandParser {
    board;
    static pgnRegex = /([RNBQKP])?([a-h])?([1-8])?(x)?([a-h])([1-8])(\+|#|=([RNBQ]))?/i;
    static gameEndRegex = /(0-1)|(1-0)|(1\/2-1\/2)/i;
    static castleRegex = /o-o(-o)?/i;
    static xStrToInt = {
        'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'f': 5, 'g': 6, 'h': 7
    };
    constructor(board) {
        this.board = board;
    }
    /**
     * Parses a normal move (one piece moves) in PGN format
     */
    parsePGNNormal(str) {
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
    execCastleIfIs(str) {
        const match = CommandParser.castleRegex.exec(str);
        if (!match) {
            return false;
        }
        const [fullMatchStr, queenSide] = match;
        this.board.castle(Boolean(queenSide));
        return true;
    }
    execGameEndIfIs(str) {
        const match = CommandParser.gameEndRegex.exec(str);
        if (!match) {
            return false;
        }
        const [fullMatchStr, blackWin, whiteWin, draw] = match;
        if (whiteWin && this.board.blackTurn) {
            throw new errors_1.ChessUnknownError("Black resigns; White wins. Game end handler not implemented.");
        }
        else if (blackWin && !this.board.blackTurn) {
            throw new errors_1.ChessUnknownError("White resigns; Black wins. Game end handler not implemented.");
        }
        else if (draw) {
            throw new errors_1.ChessUnknownError("Draw offering not implemented");
        }
        else {
            throw new errors_1.ChessUnknownError("You cannot make yourself win.");
        }
    }
    tryExec(command) {
        if (this.execCastleIfIs(command)) {
            return;
        }
        if (this.execGameEndIfIs(command)) {
            return;
        }
        const moveData = this.parsePGNNormal(command);
        if (!moveData) {
            throw new errors_1.ChessParseError("Invalid command");
        }
        const moves = this.getPossibleMoves(moveData);
        if (moves.length > 1) {
            throw new errors_1.ChessParseError("Ambigious move. More than one move matches criteria.");
        }
        if (moves.length < 1) {
            if (command.toLowerCase().startsWith("b")) {
                // in case "bxc6"-alike is interpreted as bishop move, try as pawn move
                this.tryExec("p" + command);
                return;
            }
            throw new errors_1.ChessParseError("No legal moves");
        }
        const [movePeice, moveTo] = moves[0];
        this.board.move(movePeice.x, movePeice.y, // piece location
        moveTo[0], moveTo[1], // new piece location
        moveTo[2] // en passe
        );
    }
    getPossibleMoves(moveData) {
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
        return moves;
    }
    _xStrToInt(xStr) {
        return CommandParser.xStrToInt[xStr.toLowerCase()];
    }
    _yStrToInt(yStr) {
        return parseInt(yStr) - 1;
    }
}
exports.default = CommandParser;
