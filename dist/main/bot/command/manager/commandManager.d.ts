import BotHooks from "../../botHooks.js";
import CommandDispatcher from "./commandDispatcher.js";
import BotCommandHelp from "../commandHelp.js";
import BotCommand from "../command.js";
import BotCommandCallback from "../commandCallback.js";
import BotCommandOptions from "../commandOptions.js";
declare class CommandManager {
    botHooks: BotHooks;
    dispatch: CommandDispatcher;
    /** list of commands registered */
    commands: BotCommand[];
    /** groups of commands */
    commandGroups: Map<string | undefined, BotCommand[]>;
    /** Data for help */
    helpData: {
        [x: string]: BotCommandHelp | null | undefined;
    };
    constructor(botHooks: BotHooks);
    getHelp(command: string): BotCommandHelp | null | undefined;
    register(triggerWord: string, pluginName: string, func: BotCommandCallback, options?: BotCommandOptions): void;
    /** Apply config from bot.config to adjust command */
    private applyConfigToCommand;
    private addCommandToGroup;
    private registerHelp;
}
export default CommandManager;
