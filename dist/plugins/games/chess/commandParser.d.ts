import ChessBoard from "./chessBoard";
import { PieceType } from "./chessPieces";
export default class CommandParser {
    private board;
    private static pgnRegex;
    private static xStrToInt;
    constructor(board: ChessBoard);
    parsePGN(str: string): MoveData | undefined;
    tryExec(command: string): void;
    private _xStrToInt;
    private _yStrToInt;
}
interface MoveData {
    piece: PieceType;
    targetX: number;
    targetY: number;
    fromX?: number;
    fromY?: number;
    capture?: boolean;
    check?: boolean;
    checkmate?: boolean;
    promotion?: PieceType;
}
export {};
