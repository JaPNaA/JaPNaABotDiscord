import ChessBoard from "./chessBoard";
import { NormalMoveData } from "./chessHistory";
import { charToPiece, King, Piece, PieceType } from "./chessPieces";

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
        const king = this.board.getPieces(King, this.board.blackTurn)[0];
        if (!king) { throw new Error("No king on board"); }
        if (this.board.history.hasKingMoved(this.board.blackTurn)) {
            throw new Error("Cannot castle after King moves");
        }

        // * todo: move logic to chessBoard
        const kingTargetX = king.x + 2 * (queenSide ? -1 : 1);
        const rookX = queenSide ? 0 : 7;
        const rookTargetX = king.x + 1 * (queenSide ? -1 : 1);

        if (this.board.history.hasRookMoved(this.board.blackTurn, rookX, king.y)) {
            throw new Error("Cannot castle after Rook moves.");
        }

        if (!this.isLineOfSpacesSafe(king.x, kingTargetX, king.y)) {
            throw new Error("Cannot castle through check.");
        }

        if (!this.isLineOfSpacesEmptyExceptEnds(king.x, rookX, king.y)) {
            throw new Error("Cannot castle through pieces.");
        }

        this.board.castle(
            king.x, king.y, kingTargetX, king.y,
            rookX, king.y, rookTargetX, king.y,
            Boolean(queenSide)
        );

        return true;
    }

    private isLineOfSpacesSafe(fromX: number, toX: number, y: number) {
        const lowerX = Math.min(fromX, toX);
        const higherX = Math.max(fromX, toX);
        for (let x = lowerX; x <= higherX; x++) {
            if (!this.board.isSafe(this.board.blackTurn, x, y)) {
                return false;
            }
        }
        return true;
    }

    private isLineOfSpacesEmptyExceptEnds(fromX: number, toX: number, y: number) {
        const lowerX = Math.min(fromX, toX);
        const higherX = Math.max(fromX, toX);
        for (let x = lowerX + 1; x < higherX; x++) {
            if (!this.board.isEmpty(x, y)) {
                return false;
            }
        }
        return true;
    }

    execGameEndIfIs(str: string) {
        const match = CommandParser.gameEndRegex.exec(str);
        if (match) {
            throw new Error("Game ending not implemented");
        }
        return false;
    }

    tryExec(command: string) {
        if (this.execCastleIfIs(command)) { return; }
        if (this.execGameEndIfIs(command)) { return; }

        const moveData = this.parsePGNNormal(command);
        if (!moveData) { throw new Error("Invalid command"); }

        const moves = this.getPossibleMoves(moveData)

        if (moves.length > 1) { throw new Error("Ambigious move"); }
        if (moves.length < 1) {
            if (command.toLowerCase().startsWith("b")) {
                // in case "bxc6"-alike is interpreted as bishop move, try as pawn move
                this.tryExec("p" + command);
                return;
            }
            throw new Error("No legal moves");
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
