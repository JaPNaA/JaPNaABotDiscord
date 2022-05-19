import ChessBoard from "./chessBoard";
import { MoveData } from "./chessHistory";
import { PieceType } from "./chessPieces";
export default class CommandParser {
    private board;
    private static pgnRegex;
    private static xStrToInt;
    constructor(board: ChessBoard);
    parsePGN(str: string): PartialMoveData | undefined;
    tryExec(command: string): void;
    private _xStrToInt;
    private _yStrToInt;
}
interface PartialMoveData extends Partial<MoveData> {
    piece: PieceType;
    targetX: number;
    targetY: number;
}
export {};
