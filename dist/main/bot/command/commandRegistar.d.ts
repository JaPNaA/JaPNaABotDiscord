import BotHooks from "../botHooks.js";
import CommandManager from "./commandManager.js";
import BotPlugin from "../../plugin.js";
import BotCommandOptions from "../../botcommandOptions.js";
import BotCommandHelp from "../../botcommandHelp.js";
import PrecommandCallback from "../../precommandCallback.js";
import BotCommandCallback from "../../botcommandCallback.js";
declare class CommandRegistar {
    botHooks: any;
    manager: any;
    /**
     * @param {BotHooks} botHooks
     */
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
