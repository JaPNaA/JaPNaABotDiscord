/**
 * @typedef {import("../src/events.js").DiscordCommandEvent} DiscordCommandEvent
 * @typedef {import("./bot.js")} Bot
 */

class BotCommand {
    constructor(bot, triggerWord, func, requiredPermission) {
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
        this.requiredPermission = requiredPermission;

        /**
         * The word that triggers the command
         */
        this.triggerWord = triggerWord.toLowerCase();
    }

    /**
     * Tests if the commandWord matches, and runs the command if it does.
     * @param {DiscordCommandEvent} commandEvent the event triggering function
     * @returns {Boolean} Was the command was ran
     */
    testAndRun(commandEvent) {
        let commandContent = commandEvent.commandContent;
        if (commandContent.startsWith(this.triggerWord)) {
            let permissions = this.bot.getPermissions_channel(commandEvent.userId, commandEvent.channelId);
            let argString = commandContent.slice(this.triggerWord.length);
            
            if (!this.requiredPermission || permissions.has(this.requiredPermission)) {
                this.tryRunCommand(commandEvent, argString.trimLeft());
            } else {
                this.bot.send(commandEvent.channelId, 
                    "<@" + commandEvent.userId + "> **You must have " +
                    this.requiredPermission + " permissions to run this command.**"
                );
            }

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