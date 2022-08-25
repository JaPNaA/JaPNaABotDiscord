import Bot from "../../main/bot/bot/bot";
import CommandManager from "../../main/bot/command/manager/commandManager";
import BotPlugin from "../../main/bot/plugin/plugin";
import DiscordCommandEvent from "../../main/bot/events/discordCommandEvent";
import Games from "../games";

abstract class Game extends BotPlugin {
    parentPlugin: Games;
    channelId: string;

    commandManager: CommandManager;
    _gamePluginName: string;
    gameName: string;

    gameEnded: boolean = false;

    constructor(bot: Bot, parentPlugin: Games, channelId: string) {
        super(bot);
        this.parentPlugin = parentPlugin;
        this.channelId = channelId;

        this.commandManager = new CommandManager(this.bot);

        this.gameName = this.constructor.name;
        this._gamePluginName = this.gameName.toLowerCase();
        this.pluginName = "game." + this._gamePluginName;

        this._registerUnknownCommandHandler(this.commandManager, this.unknownCommandHandler);
    }

    unknownCommandHandler(event: DiscordCommandEvent) {
        this.bot.client.send(
            event.channelId,
            "That command doesn't exist!\n" +
            "(You're playing " + this.gameName + ")"
        );
    }
}

export default Game;