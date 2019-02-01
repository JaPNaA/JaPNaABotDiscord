import Game from "../game";
import BotHooks from "../../../main/bot/bot/botHooks";
import Games from "../../games";
import DiscordCommandEvent from "../../../main/bot/types/discordCommandEvent";
import PresidentsMain from "./game";
/**
 * Handles leaving and joining of Presidents, as long as some aliases to other
 * components
 */
declare class Presidents extends Game {
    _gamePluginName: string;
    _pluginName: string;
    gameName: string;
    initer: string;
    channelId: string;
    game: PresidentsMain;
    constructor(botHooks: BotHooks, parentPlugin: Games, channelId: string, initer: string);
    join(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    silentlyAddPlayer(userId: string): void;
    addPlayer(userId: string): void;
    handleJoinError(err: Error, userId: string): void;
    leave(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    start(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    listPlayers(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    playerUse(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    playerPass(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    _sendStartingMessage(): void;
    _startGame(): void;
    _start(): void;
    _sendAboutMessage(): void;
    _stop(): void;
}
export default Presidents;
