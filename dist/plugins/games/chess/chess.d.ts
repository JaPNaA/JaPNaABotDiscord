import Game from "../../games/game";
import Bot from "../../../main/bot/bot/bot";
import Games from "../../games";
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
    _exec(userId: string, messageId: string, command: string): Promise<void>;
    _sendBoard(): void;
    _sendError(error: any, channelId: string): void;
    _isTurn(userId: string): boolean;
    _getWhitePlayer(): string;
    _getBlackPlayer(): string;
    _isPlayer(userId: string): boolean;
    _start(): Promise<void>;
    _stop(): void;
}
export default Chess;
