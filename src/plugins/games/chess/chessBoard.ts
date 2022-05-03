import { charToPiece, Piece, PieceType } from "./chessPieces";

export default class ChessBoard {
    public blackTurn: boolean = false;

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
        const piece = this.board[fromY][fromX];
        if (piece === null) { throw new Error(`No piece on (${fromX}, ${fromY}).`) }
        this.board[fromY][fromX] = null;

        const targetPos = this.board[toY][toX];
        if (targetPos !== null) {
            this.captures.push(targetPos);
        }

        this.board[toY][toX] = piece;
        piece.x = toX;
        piece.y = toY;
    }

    public getPieces(pieceType: PieceType, isBlack: boolean) {
        const pieces = [];

        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = this.board[y][x];
                if (piece instanceof pieceType && piece.isBlack === isBlack) {
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
        str.push("\n" + (this.blackTurn ? "black" : "white") + "'s turn");
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
