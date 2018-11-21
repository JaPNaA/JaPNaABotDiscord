/**
 * @typedef {import("../src/events.js").DiscordCommandEvent} DiscordCommandEvent
 * @typedef {import("./bot.js")} Bot
 * @typedef {import("./botcommandOptions.js")} BotCommandOptions
 * @typedef {import("./botcommandHelp.js")} BotCommandHelp
 */

class BotCommand {
    /**
     * BotCommand constructor
     * @param {Bot} bot bot
     * @param {String} commandName command name
     * @param {Function} func function to call
     * @param {BotCommandOptions} [options] command triggering options
     */
    constructor(bot, commandName, func, options) {
        /** @type {Bot} */
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
        this.help = (options && options.help);

        /**
         * The word that triggers the command
         */
        this.commandName = commandName.toLowerCase();
    }

    /**
     * Tests if the commandWord matches, and runs the command if it does.
     * @param {DiscordCommandEvent} commandEvent the event triggering function
     * @returns {Boolean} Was the command was ran
     */
    testAndRun(commandEvent) {
        let commandContent = commandEvent.commandContent;
        let commandContentClean = commandContent.toLowerCase().trimLeft();

        if (commandContentClean.startsWith(this.commandName)) {
            let permissions = this.bot.getPermissions_channel(commandEvent.userId, commandEvent.channelId);
            let argString = commandContent.slice(this.commandName.length);
            
            if (this.noDM && !this.bot.getChannel(commandEvent.channelId)) {
                this.bot.send(commandEvent.channelId,
                    "You cannot run this command in Direct Messages"
                );
                return true;
            }

            if (this.requiredPermission && !permissions.has(this.requiredPermission)) {
                this.bot.send(commandEvent.channelId, 
                    "<@" + commandEvent.userId + "> **You must have `" +
                    this.requiredPermission + "` permissions to run this command.**"
                );
                return true;
            }

            this.tryRunCommand(commandEvent, argString.trimLeft());

            return true;
        }

        return false;
    }

    tryRunCommand(commandEvent, argString) {
        try {
            this.func(this.bot, commandEvent, argString);
        } catch (e) {
            /** @type {String} */
            let msg = e.stack;

            msg = msg.split(__dirname).join(".");

            this.bot.send(commandEvent.channelId,
                "```An error occured\n" + msg + "```"
            );
        }
    }
}

module.exports = BotCommand;