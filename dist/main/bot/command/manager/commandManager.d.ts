import CommandDispatcher from "./commandDispatcher.js";
import { BotCommandHelpFull } from "../commandHelp.js";
import BotCommand from "../command.js";
import BotCommandCallback from "../commandCallback.js";
import BotCommandOptions from "../commandOptions.js";
import Bot from "../../bot/bot.js";
declare class CommandManager {
    private bot;
    dispatch: CommandDispatcher;
    /** list of commands registered */
    commands: BotCommand[];
    /** called when an unknown command is called */
    unknownCommandHandler?: BotCommand;
    /** groups of commands */
    commandGroups: Map<string | undefined, BotCommand[]>;
    /** Data for help */
    helpData: {
        [x: string]: BotCommandHelpFull | null | undefined;
    };
    constructor(bot: Bot);
    getHelp(command: string): BotCommandHelpFull | null | undefined;
    register(triggerWord: string, pluginName: string, func: BotCommandCallback, options?: BotCommandOptions): void;
    unregister(triggerWord: string): void;
    registerUnkownCommandHanlder(func: BotCommandCallback): void;
    /** Apply config from bot.config to adjust command */
    private applyConfigToCommand;
    private addCommandToGroup;
    private removeCommandFromGroup;
    private registerHelp;
    private unregisterHelp;
}
export default CommandManager;
