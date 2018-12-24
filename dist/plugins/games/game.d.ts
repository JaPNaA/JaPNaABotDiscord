import BotHooks from "../../main/bot/botHooks";
import CommandManager from "../../main/bot/command/manager/commandManager";
import BotPlugin from "../../main/bot/plugin/plugin";
declare abstract class Game extends BotPlugin {
    commandManager: CommandManager;
    constructor(botHooks: BotHooks);
}
export default Game;
