/** Represents a user error */
export declare class ChessError extends Error {
}
export declare class ChessParseError extends ChessError {
    constructor(message?: string);
}
export declare class ChessInvalidMoveError extends ChessError {
    constructor(message?: string);
}
export declare class ChessUnknownError extends ChessError {
    constructor(message?: string);
}
