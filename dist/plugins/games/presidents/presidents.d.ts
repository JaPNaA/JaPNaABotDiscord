import Game from "../game";
import Bot from "../../../main/bot/bot/bot";
import Games from "../../games";
import DiscordCommandEvent from "../../../main/bot/events/discordCommandEvent";
import PresidentsMain from "./game";
import Lobby from "../utils/lobby";
/**
 * Handles leaving and joining of Presidents, as long as some aliases to other
 * components
 */
declare class Presidents extends Game {
    _gamePluginName: string;
    pluginName: string;
    gameName: string;
    initer: string;
    game: PresidentsMain;
    lobby: Lobby;
    constructor(bot: Bot, parentPlugin: Games, channelId: string, initer: string);
    playerUse(event: DiscordCommandEvent): void;
    playerPass(event: DiscordCommandEvent): void;
    _startGame(): void;
    _start(): Promise<void>;
    _stop(): void;
}
export default Presidents;
