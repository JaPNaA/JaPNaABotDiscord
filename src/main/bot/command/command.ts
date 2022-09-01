import Logger from "../../utils/logger.js";
import createErrorString from "../../utils/str/createErrorString";
import { inspect } from "util";
import DiscordCommandEvent from "../events/discordCommandEvent";
import BotCommandCallback from "./commandCallback.js";
import Permissions from "../../types/permissions.js";
import mention from "../../utils/str/mention";
import Bot from "../bot/bot.js";
import { BotCommandHelp } from "./commandHelp.js";
import BotCommandOptions from "./commandOptions.js";
import { PermissionString } from "discord.js";
import { Action, ReplySoft } from "../actions/actions.js";

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
    bot: Bot;
    /** Function to call when command is called */
    func: BotCommandCallback;
    /** Custom permission required to run command */
    requiredCustomPermission: string | undefined;
    /** Discord permission required to run command */
    requiredDiscordPermission: PermissionString | undefined;
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

    constructor(bot: Bot, commandName: string, pluginName: string, func: BotCommandCallback, options?: BotCommandOptions) {
        this.bot = bot;
        this.func = func;
        this.requiredCustomPermission = options && options.requiredCustomPermission;
        this.requiredDiscordPermission = options && options.requiredDiscordPermission;
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
    async test(commandEvent: DiscordCommandEvent): Promise<TestResults> {
        let cleanCommandContent: CleanCommandContent = this._getCleanCommandContent(commandEvent.commandContent);

        if (
            cleanCommandContent.commandContent.startsWith(this.commandName) &&
            (
                !cleanCommandContent.nextCharAfterCommand ||
                whitespaceRegex.test(cleanCommandContent.nextCharAfterCommand)
            )
        ) {
            let permissions: Permissions = await
                this.bot.permissions.getPermissions_channel(
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

            if (this.requiredDiscordPermission && !permissions.hasDiscord(this.requiredDiscordPermission)) {
                return {
                    canRun: false,
                    reasonCannotRun: mention(commandEvent.userId) + " **You must have `" +
                        this.requiredDiscordPermission + "` permissions to run this command.**"
                };
            }

            if (this.requiredCustomPermission && !permissions.hasCustom(this.requiredCustomPermission)) {
                return {
                    canRun: false,
                    reasonCannotRun: mention(commandEvent.userId) + " **You must have custom `" +
                        this.requiredCustomPermission + "` permissions to run this command.**"
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
    async testAndRun(commandEvent: DiscordCommandEvent): Promise<boolean> {
        let results: TestResults = await this.test(commandEvent);
        if (results.canRun) {
            let cleaned: CleanCommandContent = this._getCleanCommandContent(commandEvent.commandContent);
            commandEvent.arguments = cleaned.args;
            this.tryRunCommand(commandEvent, cleaned.args);
            return true;
        } else {
            if (results.reasonCannotRun) {
                this.bot.client.send(commandEvent.channelId, results.reasonCannotRun);
                return true;
            }

            return false;
        }
    }

    sendError(commandEvent: DiscordCommandEvent, argString: string, error: Error): void {
        const errorStr: string = createErrorString(error);

        const messageShort = "An error occured\n```" + error.message;
        const messageLong =
            "```An error occured" +
            "\nCommand: " + this.commandName +
            "\nArguments: " + argString +
            "\nEvent: " + inspect(commandEvent, { depth: 3 }) +
            "\n" + errorStr;

        Logger.warn(messageLong);

        this.bot.client.send(commandEvent.channelId, messageShort.slice(0, 1997) + "```");
    }

    /** Tries to run command, and sends an error message if fails */
    async tryRunCommand(commandEvent: DiscordCommandEvent, argString: string) {
        try {
            for await (const action of this.func(commandEvent)) {
                if (action instanceof Action) {
                    await action.perform(this.bot, commandEvent);
                } else {
                    await new ReplySoft(action)
                        .perform(this.bot, commandEvent);
                }

            }
        } catch (error) {
            this.sendError(commandEvent, argString, error as Error);
        }
    }
}

export default BotCommand;