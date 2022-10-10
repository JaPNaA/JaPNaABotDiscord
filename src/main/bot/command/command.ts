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
import { Action, ReplySoft, ReplyUnimportant } from "../actions/actions.js";

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
    private bot: Bot;
    /** Function to call when command is called */
    private func: BotCommandCallback;
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

    /** Tries to run command, and sends an error message if fails */
    async run(commandEvent: DiscordCommandEvent) {
        for await (const action of this.tryRunCommandGenerator(commandEvent)) {
            await action.perform(this.bot, commandEvent);
        }
    }

    async *tryRunCommandGenerator(commandEvent: DiscordCommandEvent) {
        // find arguments in command message, if not already found
        if (!commandEvent.arguments) {
            const cleaned = this._getCleanCommandContent(commandEvent.commandContent);
            commandEvent.arguments = cleaned.args;
        }

        const results = await this.testPermissions(commandEvent);
        if (!results.canRun && results.reasonCannotRun) {
            yield new ReplyUnimportant(results.reasonCannotRun);
            return;
        }

        try {
            const gen = this.func(commandEvent);
            let result;
            do {
                result = await gen.next();
                const action = result.value;
                if (action instanceof Action) {
                    yield action;
                } else if (action) {
                    yield new ReplySoft(action);
                }
            } while (!result.done);
        } catch (error) {
            yield this.getErrorAction(commandEvent, error as Error);
        }
    }

    public isCommandEventMatch(commandEvent: DiscordCommandEvent): boolean {
        let cleanCommandContent: CleanCommandContent = this._getCleanCommandContent(commandEvent.commandContent);

        return cleanCommandContent.commandContent.startsWith(this.commandName) &&
            (
                !cleanCommandContent.nextCharAfterCommand ||
                whitespaceRegex.test(cleanCommandContent.nextCharAfterCommand)
            );
    }

    /**
     * Returns cleaned command content
     * @param dirtyContent dirty content to be cleaned
     * @returns cleaned command content
     */
    private _getCleanCommandContent(dirtyContent: string): CleanCommandContent {
        let trimmed: string = dirtyContent.trimStart();
        let args: string = trimmed.slice(this.commandName.length + 1); // the +1 is the space after the command
        let commandContent: string = trimmed.toLowerCase();
        let nextCharAfterCommand: string = commandContent[this.commandName.length];

        return {
            commandContent: commandContent,
            args: args,
            nextCharAfterCommand: nextCharAfterCommand
        };
    }

    private async testPermissions(commandEvent: DiscordCommandEvent) {
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

    private getErrorAction(commandEvent: DiscordCommandEvent, error: Error) {
        const errorStr: string = createErrorString(error);

        const messageShort = "An error occured\n```" + error.message;
        const messageLong =
            "```An error occured" +
            "\nCommand: " + this.commandName +
            "\nEvent: " + inspect(commandEvent, { depth: 3 }) +
            "\n" + errorStr;

        Logger.warn(messageLong);

        return new ReplySoft(messageShort.slice(0, 1997) + "```");
    }
}

export default BotCommand;