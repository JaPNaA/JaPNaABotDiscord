import Game from "../game";
import Bot from "../../../main/bot/bot/bot";
import Games from "../../games";
import DiscordCommandEvent from "../../../main/bot/events/discordCommandEvent";
import PresidentsMain from "./game";
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
    constructor(bot: Bot, parentPlugin: Games, channelId: string, initer: string);
    join(event: DiscordCommandEvent): void;
    silentlyAddPlayer(userId: string): void;
    addPlayer(userId: string): void;
    handleJoinError(err: Error, userId: string): void;
    leave(event: DiscordCommandEvent): void;
    start(event: DiscordCommandEvent): void;
    listPlayers(event: DiscordCommandEvent): void;
    playerUse(event: DiscordCommandEvent): void;
    playerPass(event: DiscordCommandEvent): void;
    _sendStartingMessage(): void;
    _startGame(): void;
    _start(): void;
    _sendAboutMessage(): void;
    _stop(): void;
}
export default Presidents;
