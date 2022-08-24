import { ChessHistory, NormalMoveData } from "./chessHistory";
import { charToPiece, King, Piece, PieceType } from "./chessPieces";

export default class ChessBoard {
    public blackTurn: boolean = false;
    public history: ChessHistory = new ChessHistory();

    private board: (Piece | null)[][];
    private captures: Piece[] = [];

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

    private setup(setup: string[]) {
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const char = setup[7 - y][x]; // read setup backwards (setup is backwards)
                const lowercase = char.toLowerCase();
                const pieceType = charToPiece[lowercase];
                let piece = null;
                if (pieceType) {
                    piece = new pieceType(lowercase !== char, x, y, this);
                }
                this.board[y][x] = piece;
            }
        }
    }

    public isOnBoard(x: number, y: number) {
        return x >= 0 && x < 8 && y >= 0 && y < 8;
    }

    public isEmpty(x: number, y: number) {
        return this.isOnBoard(x, y) && this.board[y][x] === null;
    }

    public hasPieceOn(x: number, y: number) {
        return this.isOnBoard(x, y) && this.board[y][x] !== null;
    }

    public hasColorPieceOn(x: number, y: number, isBlack: boolean) {
        if (!this.isOnBoard(x, y)) { return false; }
        const piece = this.board[y][x];
        return piece !== null && piece.isBlack === isBlack;
    }

    public move(fromX: number, fromY: number, toX: number, toY: number, enPasse?: boolean) {
        const historyRecord = enPasse ?
            this._moveEnPasseNoCheck(fromX, fromY, toX, toY)
            : this._moveNoCheck(fromX, fromY, toX, toY);

        // blackTurn has already been flipped in _moveNoCheck
        if (this.isCheck(!this.blackTurn)) {
            this.undo();
            throw new Error("King in check");
        }

        historyRecord.check = this.isCheck(this.blackTurn);
        historyRecord.checkmate = this.isCheckmate(this.blackTurn);
    }

    public castle(queenSide: boolean) {
        const king = this.getPieces(King, this.blackTurn)[0];
        if (!king) { throw new Error("No king on board"); }
        if (this.history.hasKingMoved(this.blackTurn)) {
            throw new Error("Cannot castle after King moves");
        }

        const kingTargetX = king.x + 2 * (queenSide ? -1 : 1);
        const rookX = queenSide ? 0 : 7;
        const rookTargetX = king.x + 1 * (queenSide ? -1 : 1);

        if (this.history.hasRookMoved(this.blackTurn, rookX, king.y)) {
            throw new Error("Cannot castle after Rook moves.");
        }

        if (!this._isLineOfSpacesSafe(this.blackTurn, king.x, kingTargetX, king.y)) {
            throw new Error("Cannot castle through check.");
        }

        if (!this._isLineOfSpacesEmptyExceptEnds(king.x, rookX, king.y)) {
            throw new Error("Cannot castle through pieces.");
        }

        this._castle(
            king.x, king.y, kingTargetX, king.y,
            rookX, king.y, rookTargetX, king.y,
        );

        this.blackTurn = !this.blackTurn;

        this.history.recordMove({
            isCastle: true,
            check: this.isCheck(this.blackTurn),
            checkmate: this.isCheckmate(this.blackTurn),
            queenSide: queenSide
        });
    }

    private _castle(
        fromKingX: number, fromKingY: number, toKingX: number, toKingY: number,
        fromRookX: number, fromRookY: number, toRookX: number, toRookY: number,
    ) {
        // this should be checking for validity;
        // move below logic to private _castle
        const king = this.board[fromKingY][fromKingX];
        this.board[fromKingY][fromKingX] = null;
        if (!king) { throw new Error("Castle but can't find king."); }

        const rook = this.board[fromRookY][fromRookX];
        this.board[fromRookY][fromRookX] = null;
        if (!rook) { throw new Error("Castle but can't find rook."); }

        this.board[toKingY][toKingX] = king;
        this.board[toRookY][toRookX] = rook;

    }


    private _isLineOfSpacesSafe(blackTurn: boolean, fromX: number, toX: number, y: number) {
        const lowerX = Math.min(fromX, toX);
        const higherX = Math.max(fromX, toX);
        for (let x = lowerX; x <= higherX; x++) {
            if (!this.isSafe(blackTurn, x, y)) {
                return false;
            }
        }
        return true;
    }

    private _isLineOfSpacesEmptyExceptEnds(fromX: number, toX: number, y: number) {
        const lowerX = Math.min(fromX, toX);
        const higherX = Math.max(fromX, toX);
        for (let x = lowerX + 1; x < higherX; x++) {
            if (!this.isEmpty(x, y)) {
                return false;
            }
        }
        return true;
    }

    private _moveEnPasseNoCheck(fromX: number, fromY: number, toX: number, toY: number) {
        const capture = this.board[fromY][toX];
        if (!capture) { throw new Error("Tried to en passe without piece capture"); }
        this.board[fromY][toX] = null;

        const historyRecord = this._moveNoCheck(fromX, fromY, toX, toY);
        historyRecord.enPasse = true;
        historyRecord.capture = true;
        historyRecord.capturedPiece = capture;
        return historyRecord;
    }

    private _moveNoCheck(fromX: number, fromY: number, toX: number, toY: number): NormalMoveData {
        const piece = this.board[fromY][fromX];
        if (piece === null) { throw new Error(`No piece on (${fromX}, ${fromY}).`) }
        this.board[fromY][fromX] = null;

        const targetPosPiece = this.board[toY][toX];
        if (targetPosPiece !== null) {
            this.captures.push(targetPosPiece);
        }

        this.board[toY][toX] = piece;
        piece.x = toX;
        piece.y = toY;

        const historyRecord = {
            piece: piece.constructor as PieceType,
            targetX: toX,
            targetY: toY,
            fromX: fromX,
            fromY: fromY,
            capture: targetPosPiece !== null,
            capturedPiece: targetPosPiece ? targetPosPiece : undefined,
            enPasse: false,
            isCastle: false as false,
            check: false,
            checkmate: false
        };

        this.history.recordMove(historyRecord);

        this.blackTurn = !this.blackTurn;

        return historyRecord;
    }

    public undo() {
        const move = this.history.popMove();
        if (!move) { return; }

        if (move.isCastle) {
            throw new Error("Undo castle not implemented");
        }

        const piece = this.board[move.targetY][move.targetX];
        if (piece === null) { throw new Error(`No piece on (${move.targetX}, ${move.targetY}).`); }
        this.board[move.targetY][move.targetX] = null;

        const targetPosPiece = this.board[move.fromY][move.fromX];
        if (targetPosPiece !== null) { throw new Error(`Piece already on (${move.fromX}, ${move.fromY})`); }
        this.board[move.fromY][move.fromX] = piece;
        piece.x = move.fromX;
        piece.y = move.fromY;

        if (move.capture) {
            if (!move.capturedPiece) { throw new Error("Undoing corrupted move"); }
            let capturedPieceX = move.targetX;
            let capturedPieceY = move.targetY;

            if (move.enPasse) {
                capturedPieceX = move.targetX;
                capturedPieceY = move.fromY;
            }

            this.board[capturedPieceY][capturedPieceX] = move.capturedPiece;
            move.capturedPiece.x = capturedPieceX;
            move.capturedPiece.y = capturedPieceY;
        }

        this.blackTurn = !this.blackTurn;
    }

    public isCheck(forBlack: boolean): boolean {
        const kings = this.getPieces(King, forBlack);
        if (kings.length != 1) { return false; }
        const king = kings[0];
        return !this.isSafe(forBlack, king.x, king.y);
    }

    public isSafe(forBlack: boolean, x: number, y: number) {
        const opponentPieces = this.getColorPieces(!forBlack);

        for (const opponentPiece of opponentPieces) {
            for (const possibleMove of opponentPiece.getValidMoves()) {
                if (possibleMove[0] === x && possibleMove[1] === y) {
                    return false;
                }
            }
        }
        return true;
    }

    public isCheckmate(forBlack: boolean): boolean {
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

    public getPieces(pieceType: PieceType, isBlack: boolean) {
        return this.getColorPieces(isBlack).filter(piece => piece instanceof pieceType);
    }

    public getColorPieces(isBlack: boolean): Piece[] {
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

    public toString(): string {
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
        } else {
            str.push("\n" + (this.blackTurn ? "black" : "white") + "'s turn");
        }
        return str.join("\n");
    }
}

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
