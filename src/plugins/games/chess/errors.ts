/** Represents a user error */
export class ChessError extends Error { }

export class ChessParseError extends ChessError {
    constructor(message = "Invalid command") {
        super(message);
    }
}

export class ChessInvalidMoveError extends ChessError {
    constructor(message = "Illegal move") {
        super(message);
    }
}

export class ChessUnknownError extends ChessError {
    constructor(message = "Unknown error") {
        super(message);
    }
}
