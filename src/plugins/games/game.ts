import BotHooks from "../../main/bot/bot/botHooks";
import CommandManager from "../../main/bot/command/manager/commandManager";
import BotPlugin from "../../main/bot/plugin/plugin";
import DiscordCommandEvent from "../../main/bot/events/discordCommandEvent";
import Games from "../games";

abstract class Game extends BotPlugin {
    parentPlugin: Games;

    commandManager: CommandManager;
    _gamePluginName: string;
    gameName: string;

    gameEnded: boolean = false;

    constructor(botHooks: BotHooks, parentPlugin: Games) {
        super(botHooks)
        this.parentPlugin = parentPlugin;

        this.commandManager = new CommandManager(this.bot);

        this.gameName = this.constructor.name;
        this._gamePluginName = this.gameName.toLowerCase();
        this._pluginName = "game." + this._gamePluginName;

        this._registerUnknownCommandHandler(this.commandManager, this.unknownCommandHandler);
    }

    unknownCommandHandler(bot: BotHooks, event: DiscordCommandEvent) {
        bot.send(
            event.channelId, 
            "lol that command doesn't exist!!1!\n" + 
            "(You're playing " + this.gameName + ")"
        );
    }
}

export default Game;