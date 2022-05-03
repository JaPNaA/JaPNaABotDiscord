import Bot from "../../main/bot/bot/bot";
import CommandManager from "../../main/bot/command/manager/commandManager";
import BotPlugin from "../../main/bot/plugin/plugin";
import DiscordCommandEvent from "../../main/bot/events/discordCommandEvent";
import Games from "../games";
declare abstract class Game extends BotPlugin {
    parentPlugin: Games;
    channelId: string;
    commandManager: CommandManager;
    _gamePluginName: string;
    gameName: string;
    gameEnded: boolean;
    constructor(bot: Bot, parentPlugin: Games, channelId: string);
    unknownCommandHandler(event: DiscordCommandEvent): void;
}
export default Game;
