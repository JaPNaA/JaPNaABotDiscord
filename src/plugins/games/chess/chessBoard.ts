import { ChessHistory, MoveData } from "./chessHistory";
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

    public move(fromX: number, fromY: number, toX: number, toY: number) {
        const historyRecord = this._moveNoCheck(fromX, fromY, toX, toY);
        // blackTurn has already been flipped in _moveNoCheck

        if (this.isCheck(!this.blackTurn)) {
            this.undo();
            throw new Error("King in check");
        }

        historyRecord.check = this.isCheck(this.blackTurn);
        historyRecord.checkmate = this.isCheckmate(this.blackTurn);
    }

    private _moveNoCheck(fromX: number, fromY: number, toX: number, toY: number): MoveData {
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
            this.board[move.targetY][move.targetX] = move.capturedPiece;
            move.capturedPiece.x = move.targetX;
            move.capturedPiece.y = move.targetY;
        }

        this.blackTurn = !this.blackTurn;
    }

    public isCheck(forBlack: boolean): boolean {
        const kings = this.getPieces(King, forBlack);
        if (kings.length != 1) { return false; }
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
