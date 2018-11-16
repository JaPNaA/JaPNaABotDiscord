/**
 * @typedef {import("../src/events.js").DiscordCommandEvent} DiscordCommandEvent
 */

class BotCommand {
    constructor(bot, triggerWord, func) {
        this.bot = bot;
        this.func = func;
        this.triggerWord = triggerWord.toLowerCase();
    }

    /**
     * Tests if the commandWord matches, and runs the command if it does.
     * @param {DiscordCommandEvent} commandEvent the event triggering function
     * @param {String} commandWord the word used in command
     * @param {String} argString the arguments of the command
     */
    testAndRun(commandEvent, commandWord, argString) {
        if (commandWord === this.triggerWord) {
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
}

module.exports = BotCommand;