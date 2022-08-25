"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChessUnknownError = exports.ChessInvalidMoveError = exports.ChessParseError = exports.ChessError = void 0;
/** Represents a user error */
class ChessError extends Error {
}
exports.ChessError = ChessError;
class ChessParseError extends ChessError {
    constructor(message = "Invalid command") {
        super(message);
    }
}
exports.ChessParseError = ChessParseError;
class ChessInvalidMoveError extends ChessError {
    constructor(message = "Illegal move") {
        super(message);
    }
}
exports.ChessInvalidMoveError = ChessInvalidMoveError;
class ChessUnknownError extends ChessError {
    constructor(message = "Unknown error") {
        super(message);
    }
}
exports.ChessUnknownError = ChessUnknownError;
