/**
 * @typedef {import("../lib/events.js").DiscordCommandEvent} DiscordCommandEvent
 * @typedef {import("./bot/botHooks.js")} BotHooks
 * @typedef {import("./botcommandOptions.js")} BotCommandOptions
 * @typedef {import("./botcommandHelp.js")} BotCommandHelp
 */

/**
 * @callback BotCommandCallback
 * @param {BotHooks} bot
 * @param {DiscordCommandEvent} event
 * @param {String} args
 */

const Logger = require("./logger.js");
const { createErrorString } = require("./utils.js");
const { inspect } = require("util");

class BotCommand {
    /**
     * BotCommand constructor
     * @param {BotHooks} bot bot
     * @param {String} commandName command name
     * @param {BotCommandCallback} func function to call
     * @param {BotCommandOptions} [options] command triggering options
     */
    constructor(bot, commandName, pluginName, func, options) {
        /** @type {BotHooks} */
        this.bot = bot;

        /**
         * Function to call when command is called
         * @type {Function}
         */
        this.func = func;

        /**
         * Permission required to run command
         * @type {String | undefined}
         */
        this.requiredPermission = options && options.requiredPermission;

        /**
         * Command can be run in Direct Messages?
         * @type {Boolean}
         */
        this.noDM = (options && options.noDM) || false;

        /**
         * Help for the command
         * @type {BotCommandHelp | undefined}
         */
        this.help = options && options.help;

        /**
         * Group the command belongs to
         * @type {String | undefined}
         */
        this.group = options && options.group;

        /**
         * The word that triggers the command
         * @type {String}
         */
        this.commandName = commandName.toLowerCase();

        /**
         * Name of plugin that registered this command
         * @type {String}
         */
        this.pluginName = pluginName;

        /**
         * Regex matches 1 whitespace
         * @type {RegExp}
         */
        this.whitespaceRegex = /\s/;
    }

    /**
     * @typedef {Object} CleanCommandContent
     * @property {String} commandContent command trimmed
     * @property {String} args arguments
     * @property {String} nextCharAfterCommand next character after the command
     */
    /**
     * Returns cleaned command content
     * @param {String} dirtyContent dirty content to be cleaned
     * @returns {CleanCommandContent} cleaned command content
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
     * @typedef {Object} TestResults
     * @property {Boolean} canRun can the command run?
     * @property {String} [reasonCannotRun] reason why the command cannot run
     */
    /**
     * Tests if command can be run
     * @param {DiscordCommandEvent} commandEvent the event to test
     * @returns {TestResults} Error string
     */
    test(commandEvent) {
        let cleanCommandContent = this._getCleanCommandContent(commandEvent.commandContent);

        if (
            cleanCommandContent.commandContent.startsWith(this.commandName) &&
            (
                !cleanCommandContent.nextCharAfterCommand ||
                this.whitespaceRegex.test(cleanCommandContent.nextCharAfterCommand)
            )
        ) {
            let permissions = this.bot.permissions.getPermissions_channel(commandEvent.userId, commandEvent.serverId, commandEvent.channelId);

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
     * @param {DiscordCommandEvent} commandEvent the event triggering function
     * @returns {Boolean} Did the command run OR not have enough permissions to run
     */
    testAndRun(commandEvent) {
        let results = this.test(commandEvent);
        if (results.canRun) {
            let cleaned = this._getCleanCommandContent(commandEvent.commandContent);
            this.tryRunCommand(commandEvent, cleaned.args);
            return true;
        } else {
            if (results.reasonCannotRun) {
                this.bot.send(commandEvent.channelId, results.reasonCannotRun);
                return true;
            }

            return false;
        }
    }

    /**
     * Sends an error message
     * @param {DiscordCommandEvent} commandEvent command event
     * @param {String} argString arguments as string
     * @param {Error} error error to send
     */
    sendError(commandEvent, argString, error) {
        let errorStr = createErrorString(error);
        let message =
            "```An error occured\n" + errorStr +
            "\nCommand: " + this.commandName +
            "\nArguments: " + argString +
            "\nEvent: " + inspect(commandEvent, { depth: 3 });

        message = message.replace(/ {4}/g, "\t");
        message = message.slice(0, 1997) + "```";

        this.bot.send(commandEvent.channelId, message);

        Logger.warn(message);
    }

    /**
     * Tries to run command, and sends an error message if fails
     * @param {DiscordCommandEvent} commandEvent command event
     * @param {String} argString arguments as string
     */
    tryRunCommand(commandEvent, argString) {
        try {
            this.func(this.bot, commandEvent, argString);
        } catch (error) {
            this.sendError(commandEvent, argString, error);
        }
    }
}

module.exports = BotCommand;