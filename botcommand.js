class BotCommand {
    constructor(bot, triggerWord, func) {
        this.bot = bot;
        this.func = func;
        this.triggerWord = triggerWord.toLowerCase();
    }

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