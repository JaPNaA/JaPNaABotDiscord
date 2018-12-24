import BotHooks from "../../main/bot/botHooks";
import CommandManager from "../../main/bot/command/manager/commandManager";
import BotPlugin from "../../main/bot/plugin/plugin";

abstract class Game extends BotPlugin {
    commandManager: CommandManager;

    constructor(botHooks: BotHooks) {
        super(botHooks)

        this.commandManager = new CommandManager(this.bot);
        this._pluginName = "game." + this.constructor.name.toLowerCase();
    }
}

export default Game;