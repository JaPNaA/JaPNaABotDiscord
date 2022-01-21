import BotPlugin from "../main/bot/plugin/plugin.js";
import { PrecommandWithoutCallback } from "../main/bot/precommand/precommand.js";
import Game from "./games/game.js";
import Bot from "../main/bot/bot/bot.js";
interface GameClass {
    new (bot: Bot, parentPlugin: Games, channelId: string, initer: string): Game;
}
/**
 * Games!
 */
declare class Games extends BotPlugin {
    precommand: PrecommandWithoutCallback;
    currentGames: Map<string, Game>;
    playerGameMap: Map<string, Game>;
    gameAliases: {
        [x: string]: GameClass;
    };
    constructor(bot: Bot);
    _isDMLockAvailable(userId: string): boolean;
    _lockAndGetDMHandle(userId: string, game: Game): void;
    _unlockDMHandle(userId: string): void;
    private play;
    private _getGame;
    _start(): void;
    private unknownCommandHandler;
    private _forwardToGameInChannel;
    private _forwardToGameFromDM;
    private _sendDoesntExist;
    private _listGames;
    _stop(): void;
}
export default Games;
