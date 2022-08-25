import ChessBoard from "./chessBoard";
import { NormalMoveData } from "./chessHistory";
import { charToPiece, Piece, PieceType } from "./chessPieces";
import { ChessParseError, ChessUnknownError } from "./errors";

export default class CommandParser {
    private static pgnRegex = /([RNBQKP])?([a-h])?([1-8])?(x)?([a-h])([1-8])(\+|#|=([RNBQ]))?/i;
    private static gameEndRegex = /(0-1)|(1-0)|(1\/2-1\/2)/i;
    private static castleRegex = /o-o(-o)?/i;
    private static xStrToInt: { [x: string]: number } = {
        'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'f': 5, 'g': 6, 'h': 7
    }

    constructor(private board: ChessBoard) { }

    /**
     * Parses a normal move (one piece moves) in PGN format
     */
    parsePGNNormal(str: string): PartialMoveData | undefined {
        const match = CommandParser.pgnRegex.exec(str);
        if (!match) { return; }
        const [
            fullMatchStr,
            peiceStr,
            fromXStr,
            fromYStr,
            captureStr,
            targetXStr,
            targetYStr,
            eventStr,
            promotionStr
        ] = match;

        return {
            piece: charToPiece[peiceStr ? peiceStr.toLowerCase() : 'p'],
            targetX: this._xStrToInt(targetXStr),
            targetY: this._yStrToInt(targetYStr),
            fromX: fromXStr ? this._xStrToInt(fromXStr) : undefined,
            fromY: fromYStr ? this._yStrToInt(fromYStr) : undefined,
            capture: Boolean(captureStr),
            check: eventStr === "+",
            checkmate: eventStr === "#",
            promotion: promotionStr ? charToPiece[promotionStr.toLowerCase()] : undefined
        }
    }

    execCastleIfIs(str: string) {
        const match = CommandParser.castleRegex.exec(str);
        if (!match) { return false; }
        const [fullMatchStr, queenSide] = match;

        this.board.castle(Boolean(queenSide));

        return true;
    }

    execGameEndIfIs(str: string) {
        const match = CommandParser.gameEndRegex.exec(str);
        if (!match) { return false; }
        const [fullMatchStr, blackWin, whiteWin, draw] = match;
        if (whiteWin && this.board.blackTurn) {
            throw new ChessUnknownError("Black resigns; White wins. Game end handler not implemented.");
        } else if (blackWin && !this.board.blackTurn) {
            throw new ChessUnknownError("White resigns; Black wins. Game end handler not implemented.");
        } else if (draw) {
            throw new ChessUnknownError("Draw offering not implemented");
        } else {
            throw new ChessUnknownError("You cannot make yourself win.");
        }
    }

    tryExec(command: string) {
        if (this.execCastleIfIs(command)) { return; }
        if (this.execGameEndIfIs(command)) { return; }

        const moveData = this.parsePGNNormal(command);
        if (!moveData) { throw new ChessParseError("Invalid command"); }

        const moves = this.getPossibleMoves(moveData)

        if (moves.length > 1) { throw new ChessParseError("Ambigious move. More than one move matches criteria."); }
        if (moves.length < 1) {
            if (command.toLowerCase().startsWith("b")) {
                // in case "bxc6"-alike is interpreted as bishop move, try as pawn move
                this.tryExec("p" + command);
                return;
            }
            throw new ChessParseError("No legal moves");
        }
        const [movePeice, moveTo] = moves[0];

        this.board.move(
            movePeice.x, movePeice.y, // piece location
            moveTo[0], moveTo[1], // new piece location
            moveTo[2] // en passe
        );
    }

    private getPossibleMoves(moveData: PartialMoveData) {
        const pieces = this.board.getPieces(moveData.piece, this.board.blackTurn);
        const moves: [Piece, [number, number, boolean?]][] = [];
        for (const piece of pieces) {
            if (
                moveData.fromX && moveData.fromX !== piece.x ||
                moveData.fromY && moveData.fromY !== piece.y
            ) { continue; }

            const pieceMoves = piece.getValidMoves();
            for (const pieceMove of pieceMoves) {
                if (pieceMove[0] === moveData.targetX && pieceMove[1] === moveData.targetY) {
                    moves.push([piece, pieceMove]);
                }
            }
        }
        return moves;
    }

    private _xStrToInt(xStr: string) {
        return CommandParser.xStrToInt[xStr.toLowerCase()];
    }

    private _yStrToInt(yStr: string) {
        return parseInt(yStr) - 1;
    }
}

interface PartialMoveData extends Partial<NormalMoveData> {
    piece: PieceType;
    targetX: number;
    targetY: number;
}
