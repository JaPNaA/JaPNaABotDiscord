import Game from "../../games/game";
import Bot from "../../../main/bot/bot/bot";
import Games from "../../games";
import { DeleteMessageSoft } from "../../../main/bot/actions/actions";
declare class Chess extends Game {
    private initer;
    _gamePluginName: string;
    pluginName: string;
    gameName: string;
    gameEnded: boolean;
    private lobby;
    private players;
    private settings;
    /** Used for settings.deleteHistory; deleting last history */
    private lastCommandMessageId?;
    private board;
    private commandParser;
    constructor(botHooks: Bot, parentPlugin: Games, channelId: string, initer: string);
    _exec(userId: string, messageId: string, command: string): AsyncGenerator<DeleteMessageSoft, string, unknown>;
    _boardToString(): string;
    _errorToString(error: any, channelId: string): string;
    _isTurn(userId: string): boolean;
    _getWhitePlayer(): string;
    _getBlackPlayer(): string;
    _isPlayer(userId: string): boolean;
    _start(): Promise<void>;
    _stop(): void;
}
export default Chess;
