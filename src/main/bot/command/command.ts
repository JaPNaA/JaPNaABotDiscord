import Logger from "../../logger.js";
import { createErrorString } from "../../utils.js";
import { inspect } from "util";
import BotCommandHelp from "./commandHelp.js";
import BotCommandOptions from "./commandOptions.js";
import BotHooks from "../botHooks.js";
import { DiscordCommandEvent } from "../../events.js";
import BotCommandCallback from "./commandCallback.js";
import Permissions from "../../permissions.js";

type CleanCommandContent = {
    /** The cleaned message */
    commandContent: string,
    /** Arguments of the command */
    args: string,
    /** The character after the command */
    nextCharAfterCommand: string
};
type TestResults = {
    /** If the command can run or not */
    canRun: boolean,
    /** Why it cannot run */
    reasonCannotRun?: string
};

const whitespaceRegex: RegExp = /\s/;

class BotCommand {
    botHooks: BotHooks;
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

    constructor(bot: BotHooks, commandName: string, pluginName: string, func: BotCommandCallback, options?: BotCommandOptions) {
        this.botHooks = bot;
        this.func = func;
        this.requiredPermission = options && options.requiredPermission;
        this.noDM = (options && options.noDM) || false;
        this.help = options && options.help;
        this.group = options && options.group;
        this.commandName = commandName.toLowerCase();
        this.pluginName = pluginName;
    }

    /**
     * Returns cleaned command content
     * @param dirtyContent dirty content to be cleaned
     * @returns cleaned command content
     */
    _getCleanCommandContent(dirtyContent: string): CleanCommandContent {
        let trimmed: string = dirtyContent.trimLeft();
        let args: string = trimmed.slice(this.commandName.length + 1); // the +1 is the space after the command
        let commandContent: string = trimmed.toLowerCase();
        let nextCharAfterCommand: string = commandContent[this.commandName.length];

        return {
            commandContent: commandContent,
            args: args,
            nextCharAfterCommand: nextCharAfterCommand
        };
    }

    /**
     * Tests if command can be run
     * @param commandEvent the event to test
     * @returns Error string
     */
    test(commandEvent: DiscordCommandEvent): TestResults {
        let cleanCommandContent: CleanCommandContent = this._getCleanCommandContent(commandEvent.commandContent);

        if (
            cleanCommandContent.commandContent.startsWith(this.commandName) &&
            (
                !cleanCommandContent.nextCharAfterCommand ||
                whitespaceRegex.test(cleanCommandContent.nextCharAfterCommand)
            )
        ) {
            let permissions: Permissions =
                this.botHooks.permissions.getPermissions_channel(
                    commandEvent.userId,
                    commandEvent.serverId,
                    commandEvent.channelId
                );

            if (this.noDM && commandEvent.isDM) {
                return {
                    canRun: false,
                    reasonCannotRun: "You cannot run this command in Direct Messages"
                };
            }

            if (this.requiredPermission && !permissions.has(this.requiredPermission)) {
                return {
                    canRun: false,
                    reasonCannotRun: "<@" + commandEvent.userId + "> **You must have `" +
                        this.requiredPermission + "` permissions to run this command.**"
                };
            }

            return { canRun: true };
        }

        return { canRun: false };
    }

    /**
     * Tests if the commandWord matches, and runs the command if it does.
     * @param commandEvent the event triggering function
     * @returns Did the command run OR not have enough permissions to run
     */
    testAndRun(commandEvent: DiscordCommandEvent): boolean {
        let results: TestResults = this.test(commandEvent);
        if (results.canRun) {
            let cleaned: CleanCommandContent = this._getCleanCommandContent(commandEvent.commandContent);
            this.tryRunCommand(commandEvent, cleaned.args);
            return true;
        } else {
            if (results.reasonCannotRun) {
                this.botHooks.send(commandEvent.channelId, results.reasonCannotRun);
                return true;
            }

            return false;
        }
    }

    sendError(commandEvent: DiscordCommandEvent, argString: string, error: Error): void {
        let errorStr: string = createErrorString(error);
        let message: string =
            "```An error occured\n" + errorStr +
            "\nCommand: " + this.commandName +
            "\nArguments: " + argString +
            "\nEvent: " + inspect(commandEvent, { depth: 3 });

        message = message.replace(/ {4}/g, "\t");
        message = message.slice(0, 1997) + "```";

        this.botHooks.send(commandEvent.channelId, message);

        Logger.warn(message);
    }

    /** Tries to run command, and sends an error message if fails */
    tryRunCommand(commandEvent: DiscordCommandEvent, argString: string): void {
        try {
            this.func(this.botHooks, commandEvent, argString);
        } catch (error) {
            this.sendError(commandEvent, argString, error);
        }
    }
}

export default BotCommand;