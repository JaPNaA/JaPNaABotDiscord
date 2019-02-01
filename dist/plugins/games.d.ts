import BotPlugin from "../main/bot/plugin/plugin.js";
import BotHooks from "../main/bot/bot/botHooks.js";
import { PrecommandWithoutCallback } from "../main/bot/precommand/precommand.js";
import Game from "./games/game.js";
interface GameClass {
    new (botHooks: BotHooks, parentPlugin: Games, channelId: string, initer: string): Game;
}
/**
 * Games!
 */
declare class Games extends BotPlugin {
    precommand: PrecommandWithoutCallback;
    currentGames: Map<string, Game>;
    playerGameMap: Map<string, Game>;
    config: {
        [x: string]: any;
    };
    gameAliases: {
        [x: string]: GameClass;
    };
    constructor(bot: BotHooks);
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
    _stop(): void;
}
export default Games;
