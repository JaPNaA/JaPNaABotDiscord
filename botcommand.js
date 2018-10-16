class BotCommand {
    constructor(bot, triggerWord, func) {
        this.bot = bot;
        this.func = func;
        this.triggerWord = triggerWord.toLowerCase();
    }

    testAndRun(commandEvent, commandWord, argString) {
        if (commandWord === this.triggerWord) {
            this.func(this.bot, commandEvent, argString);
        }
    }
}

module.exports = BotCommand;