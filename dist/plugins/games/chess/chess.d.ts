import Game from "../../games/game";
import Bot from "../../../main/bot/bot/bot";
import Games from "../../games";
import DiscordCommandEvent from "../../../main/bot/events/discordCommandEvent";
declare class Chess extends Game {
    private initer;
    _gamePluginName: string;
    pluginName: string;
    gameName: string;
    gameEnded: boolean;
    private lobby;
    private board;
    private commandParser;
    constructor(botHooks: Bot, parentPlugin: Games, channelId: string, initer: string);
    execCommand(event: DiscordCommandEvent): void;
    _start(): Promise<void>;
    _stop(): void;
}
export default Chess;
