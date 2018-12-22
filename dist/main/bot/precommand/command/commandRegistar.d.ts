import BotHooks from "../botHooks.js";
import CommandManager from "./commandManager.js";
import BotPlugin from "../../plugin.js";
import BotCommandOptions from "../../commandOptions.js";
import BotCommandHelp from "../../commandHelp.js";
import PrecommandCallback from "../precommand/precommandCallback.js";
import BotCommandCallback from "../../commandCallback.js";
declare class CommandRegistar {
    botHooks: BotHooks;
    manager: CommandManager;
    constructor(botHooks: BotHooks, manager: CommandManager);
    precommand(precommandStr: string, callback: PrecommandCallback): void;
    plugin(plugin: BotPlugin): void;
    command(triggerWord: string, pluginName: string, func: BotCommandCallback, options?: BotCommandOptions): void;
    /** Add help information */
    help(command: string, data: BotCommandHelp | null): void;
    unregisterAllPlugins(): void;
    /** Apply config from bot.config to adjust command */
    private applyConfigToCommand;
    private addCommandToGroup;
}
export default CommandRegistar;
