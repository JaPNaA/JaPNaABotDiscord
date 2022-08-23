import ChessBoard from "./chessBoard";
import { NormalMoveData } from "./chessHistory";
import { PieceType } from "./chessPieces";
export default class CommandParser {
    private board;
    private static pgnRegex;
    private static gameEndRegex;
    private static castleRegex;
    private static xStrToInt;
    constructor(board: ChessBoard);
    /**
     * Parses a normal move (one piece moves) in PGN format
     */
    parsePGNNormal(str: string): PartialMoveData | undefined;
    execCastleIfIs(str: string): boolean;
    execGameEndIfIs(str: string): boolean;
    tryExec(command: string): void;
    private _xStrToInt;
    private _yStrToInt;
}
interface PartialMoveData extends Partial<NormalMoveData> {
    piece: PieceType;
    targetX: number;
    targetY: number;
}
export {};
