import BotCommandHelp from "./botcommandHelp.js";
import BotCommandOptions from "./botcommandOptions.js";
import BotHooks from "./bot/botHooks.js";
import { DiscordCommandEvent } from "./events.js";
import BotCommandCallback from "./botcommandCallback.js";
declare type CleanCommandContent = {
    /** The cleaned message */
    commandContent: string;
    /** Arguments of the command */
    args: string;
    /** The character after the command */
    nextCharAfterCommand: string;
};
declare type TestResults = {
    /** If the command can run or not */
    canRun: boolean;
    /** Why it cannot run */
    reasonCannotRun?: string;
};
declare class BotCommand {
    bot: BotHooks;
    /** Function to call when command is called */
    func: Function;
    /** Permission required to run command */
    requiredPermission: string | undefined;
    /** Is using this command in Direct Messages disallowed? */
    noDM: boolean;
    /** Help for the command */
    help: BotCommandHelp | undefined;
    /** Group the command belongs to */
    group: string | undefined;
    /** The string that triggers the command */
    commandName: string;
    /** Name of the plugin that registered this command */
    pluginName: string | undefined;
    constructor(bot: BotHooks, commandName: string, pluginName: string, func: BotCommandCallback, options?: BotCommandOptions);
    /**
     * Returns cleaned command content
     * @param dirtyContent dirty content to be cleaned
     * @returns cleaned command content
     */
    _getCleanCommandContent(dirtyContent: string): CleanCommandContent;
    /**
     * Tests if command can be run
     * @param commandEvent the event to test
     * @returns Error string
     */
    test(commandEvent: DiscordCommandEvent): TestResults;
    /**
     * Tests if the commandWord matches, and runs the command if it does.
     * @param commandEvent the event triggering function
     * @returns Did the command run OR not have enough permissions to run
     */
    testAndRun(commandEvent: DiscordCommandEvent): boolean;
    sendError(commandEvent: DiscordCommandEvent, argString: string, error: Error): void;
    /** Tries to run command, and sends an error message if fails */
    tryRunCommand(commandEvent: DiscordCommandEvent, argString: string): void;
}
export default BotCommand;
