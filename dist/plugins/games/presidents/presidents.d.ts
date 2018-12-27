import Game from "../game";
import BotHooks from "../../../main/bot/botHooks";
import Games from "../../games";
import { DiscordCommandEvent } from "../../../main/events";
import PresidentsMain from "./game";
/**
 * Handles leaving and joining of Presidents, as long as some aliases to other
 * components
 */
declare class Presidents extends Game {
    _gamePluginName: string;
    _pluginName: string;
    gameName: string;
    channelId: string;
    game: PresidentsMain;
    constructor(botHooks: BotHooks, parentPlugin: Games, channelId: string, initer: string);
    join(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    leave(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    start(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    listPlayers(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    playerUseCard(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    _sendStartingMessage(): void;
    _startGame(): void;
    _start(): void;
    _sendAboutMessage(): void;
    _stop(): void;
}
export default Presidents;
