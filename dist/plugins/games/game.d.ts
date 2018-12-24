import BotHooks from "../../main/bot/botHooks";
import CommandManager from "../../main/bot/command/manager/commandManager";
import BotPlugin from "../../main/bot/plugin/plugin";
import { DiscordCommandEvent } from "../../main/events";
import Games from "../games";
declare abstract class Game extends BotPlugin {
    parentPlugin: Games;
    commandManager: CommandManager;
    _gamePluginName: string;
    gameName: string;
    gameEnded: boolean;
    constructor(botHooks: BotHooks, parentPlugin: Games);
    unknownCommandHandler(bot: BotHooks, event: DiscordCommandEvent): void;
}
export default Game;
