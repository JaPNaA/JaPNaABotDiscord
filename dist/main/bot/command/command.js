"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_js_1 = __importDefault(require("../../utils/logger.js"));
const utils_js_1 = require("../../utils/utils.js");
const util_1 = require("util");
const specialUtils_js_1 = require("../../utils/specialUtils.js");
const whitespaceRegex = /\s/;
class BotCommand {
    constructor(bot, commandName, pluginName, func, options) {
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
    _getCleanCommandContent(dirtyContent) {
        let trimmed = dirtyContent.trimLeft();
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
    test(commandEvent) {
        let cleanCommandContent = this._getCleanCommandContent(commandEvent.commandContent);
        if (cleanCommandContent.commandContent.startsWith(this.commandName) &&
            (!cleanCommandContent.nextCharAfterCommand ||
                whitespaceRegex.test(cleanCommandContent.nextCharAfterCommand))) {
            let permissions = this.botHooks.permissions.getPermissions_channel(commandEvent.userId, commandEvent.serverId, commandEvent.channelId);
            if (this.noDM && commandEvent.isDM) {
                return {
                    canRun: false,
                    reasonCannotRun: "You cannot run this command in Direct Messages"
                };
            }
            if (this.requiredPermission && !permissions.has(this.requiredPermission)) {
                return {
                    canRun: false,
                    reasonCannotRun: specialUtils_js_1.mention(commandEvent.userId) + " **You must have `" +
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
    testAndRun(commandEvent) {
        let results = this.test(commandEvent);
        if (results.canRun) {
            let cleaned = this._getCleanCommandContent(commandEvent.commandContent);
            commandEvent.arguments = cleaned.args;
            this.tryRunCommand(commandEvent, cleaned.args);
            return true;
        }
        else {
            if (results.reasonCannotRun) {
                this.botHooks.send(commandEvent.channelId, results.reasonCannotRun);
                return true;
            }
            return false;
        }
    }
    sendError(commandEvent, argString, error) {
        let errorStr = utils_js_1.createErrorString(error);
        let message = "```An error occured\n" + errorStr +
            "\nCommand: " + this.commandName +
            "\nArguments: " + argString +
            "\nEvent: " + util_1.inspect(commandEvent, { depth: 3 });
        message = message.replace(/ {4}/g, "\t");
        message = message.slice(0, 1997) + "```";
        this.botHooks.send(commandEvent.channelId, message);
        logger_js_1.default.warn(message);
    }
    /** Tries to run command, and sends an error message if fails */
    tryRunCommand(commandEvent, argString) {
        try {
            this.func(this.botHooks, commandEvent, argString);
        }
        catch (error) {
            this.sendError(commandEvent, argString, error);
        }
    }
}
exports.default = BotCommand;
