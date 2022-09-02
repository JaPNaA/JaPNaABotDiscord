"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_js_1 = __importDefault(require("../../utils/logger.js"));
const createErrorString_1 = __importDefault(require("../../utils/str/createErrorString"));
const util_1 = require("util");
const mention_1 = __importDefault(require("../../utils/str/mention"));
const actions_js_1 = require("../actions/actions.js");
const whitespaceRegex = /\s/;
class BotCommand {
    bot;
    /** Function to call when command is called */
    func;
    /** Custom permission required to run command */
    requiredCustomPermission;
    /** Discord permission required to run command */
    requiredDiscordPermission;
    /** Is using this command in Direct Messages disallowed? */
    noDM;
    /** Help for the command */
    help;
    /** Group the command belongs to */
    group;
    /** The string that triggers the command */
    commandName;
    /** Name of the plugin that registered this command */
    pluginName;
    constructor(bot, commandName, pluginName, func, options) {
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
    _getCleanCommandContent(dirtyContent) {
        let trimmed = dirtyContent.trimStart();
        let args = trimmed.slice(this.commandName.length + 1); // the +1 is the space after the command
        let commandContent = trimmed.toLowerCase();
        let nextCharAfterCommand = commandContent[this.commandName.length];
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
    async test(commandEvent) {
        let cleanCommandContent = this._getCleanCommandContent(commandEvent.commandContent);
        if (cleanCommandContent.commandContent.startsWith(this.commandName) &&
            (!cleanCommandContent.nextCharAfterCommand ||
                whitespaceRegex.test(cleanCommandContent.nextCharAfterCommand))) {
            let permissions = await this.bot.permissions.getPermissions_channel(commandEvent.userId, commandEvent.serverId, commandEvent.channelId);
            if (this.noDM && commandEvent.isDM) {
                return {
                    canRun: false,
                    reasonCannotRun: "You cannot run this command in Direct Messages"
                };
            }
            if (this.requiredDiscordPermission && !permissions.hasDiscord(this.requiredDiscordPermission)) {
                return {
                    canRun: false,
                    reasonCannotRun: (0, mention_1.default)(commandEvent.userId) + " **You must have `" +
                        this.requiredDiscordPermission + "` permissions to run this command.**"
                };
            }
            if (this.requiredCustomPermission && !permissions.hasCustom(this.requiredCustomPermission)) {
                return {
                    canRun: false,
                    reasonCannotRun: (0, mention_1.default)(commandEvent.userId) + " **You must have custom `" +
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
    async testAndRun(commandEvent) {
        let results = await this.test(commandEvent);
        if (results.canRun) {
            let cleaned = this._getCleanCommandContent(commandEvent.commandContent);
            commandEvent.arguments = cleaned.args;
            this.tryRunCommand(commandEvent);
            return true;
        }
        else {
            if (results.reasonCannotRun) {
                this.bot.client.send(commandEvent.channelId, results.reasonCannotRun);
                return true;
            }
            return false;
        }
    }
    getErrorAction(commandEvent, error) {
        const errorStr = (0, createErrorString_1.default)(error);
        const messageShort = "An error occured\n```" + error.message;
        const messageLong = "```An error occured" +
            "\nCommand: " + this.commandName +
            "\nEvent: " + (0, util_1.inspect)(commandEvent, { depth: 3 }) +
            "\n" + errorStr;
        logger_js_1.default.warn(messageLong);
        return new actions_js_1.ReplySoft(messageShort.slice(0, 1997) + "```");
    }
    async *tryRunCommandGenerator(commandEvent) {
        try {
            const gen = this.func(commandEvent);
            let result;
            do {
                result = await gen.next();
                const action = result.value;
                if (action instanceof actions_js_1.Action) {
                    yield action;
                }
                else if (action) {
                    yield new actions_js_1.ReplySoft(action);
                }
            } while (!result.done);
        }
        catch (error) {
            yield this.getErrorAction(commandEvent, error);
        }
    }
    /** Tries to run command, and sends an error message if fails */
    async tryRunCommand(commandEvent) {
        for await (const action of this.tryRunCommandGenerator(commandEvent)) {
            action.perform(this.bot, commandEvent);
        }
        // try {
        //     const gen = this.func(commandEvent);
        //     let result;
        //     do {
        //         result = await gen.next();
        //         const action = result.value;
        //         if (action instanceof Action) {
        //             await action.perform(this.bot, commandEvent);
        //         } else if (action) {
        //             await new ReplySoft(action)
        //                 .perform(this.bot, commandEvent);
        //         }
        //     } while (!result.done);
        // } catch (error) {
        //     this.getErrorAction(commandEvent, error as Error);
        // }
    }
}
exports.default = BotCommand;
