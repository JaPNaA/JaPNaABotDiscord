import Game from "../../games/game";
import Bot from "../../../main/bot/bot/bot";
import Games from "../../games";
declare class Chess extends Game {
    _gamePluginName: string;
    pluginName: string;
    gameName: string;
    gameEnded: boolean;
    private lobby;
    constructor(botHooks: Bot, parentPlugin: Games, channelId: string);
    _start(): Promise<void>;
    _stop(): void;
}
export default Chess;
