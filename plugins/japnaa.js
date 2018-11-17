const BotPlugin = require("../src/plugin.js");
const { stringToArgs, random, toUserId } = require("../src/utils.js");

/**
 * @typedef {import("../src/events.js").DiscordMessageEvent} DiscordMessageEvent
 * @typedef {import("../src/bot.js")} Bot
 */

/**
 * Commonly used commands made by me
 */
class Japnaa extends BotPlugin {
    constructor(bot) {
        super(bot);

        this.namespace = "japnaa";

        /**
         * Counter for this.count()
         */
        this.counter = bot.recall(this.namespace, "counter") || 0;

        
        /**
         * Que of spam functions
         * @type {Function[]}
         */
        this.spamQue = [];

        /** 
         * Spam setInverval return
         * @type {NodeJS.Timeout}
         */
        this.spamInterval = null;

        /**
         * Is spam setInterval running?
         * @type {Boolean}
         */
        this.spamIntervalActive = false;
    }

    /**
     * makes the bot count
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     */
    count(bot, event) {
        this.counter++;

        this.bot.remember(this.namespace, "counter", this.counter);

        bot.send(event.channelId, this.counter.toString() + "!");
    }

    /**
     * says whatever you say
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args what to echo back
     */
    echo(bot, event, args) {
        let json = null;
        try {
            json = JSON.parse(args);
        } catch (err) { void 0; }

        if (json) {
            bot.send(event.channelId, json);
        } else {
            bot.send(event.channelId, args);
        }
    }

    /**
     * Generates a 128 character radom string
     */
    _randomString() {
        const min = 32, max = 127;
        let rands = [];

        for (let i = 0; i < 128; i++) {
            rands.push(random(min, max, 1));
        }

        return String.fromCharCode(...rands);
    }

    /**
     * Generates random stuff
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} argString arguments [min, max, step] | "String"
     */
    random(bot, event, argString) {
        const args = stringToArgs(argString);

        // !random string
        if (args[0].toLowerCase() == "string") {
            bot.send(event.channelId, 
                "```" + 
                this._randomString()
                    .replace(/`$/g, "` ") // because discord markup
                + "```"
            );
            return;
        }

        console.log(" >> " + JSON.stringify(args));

        let max = 0;
        let min = 0;
        let step = 0;

        let result = 0;

        // do different things with different amount of arguments
        switch (args.length) {
        case 0:
            max = 1;
            min = 0;
            step = 0;
            break;
        case 1:
            max = parseFloat(args[0]);
            min = 0;
            step = 1;
            break;
        case 2:
            max = parseFloat(args[0]);
            min = parseFloat(args[1]);
            step = 1;
            break;
        case 3:
            max = parseFloat(args[0]);
            min = parseFloat(args[1]);
            step = parseFloat(args[2]);
            break;
        }

        // check if arguments are valid
        if (isNaN(max) || isNaN(min) || isNaN(step)) {
            bot.send(event.channelId, "**Invalid arguments**");
        } else {
            result = random(min, max, step);
        }

        bot.send(event.channelId, `${min} - ${max} | ${step} \u2192\n**${result}**`);
    }

    /**
     * Begins spamming from spam que with interval
     */
    _startSpam() {
        if (this.spamIntervalActive) return;
        clearInterval(this.spamInterval);
        this.spamInterval = setInterval(this._sendSpam.bind(this), 1000);
        this.spamIntervalActive = true;
    }
    
    /**
     * Stops spamming
     */
    _stopSpam() {
        clearInterval(this.spamInterval);
        this.spamQue.length = 0;
        this.spamIntervalActive = false;
    }

    /**
     * Send spam, triggered by interval, by que
     */
    _sendSpam() {
        if (this.spamQue.length) {
            let spamFunc = this.spamQue.shift();
            if (spamFunc()) {
                this.spamQue.push(spamFunc);
            }
        } else {
            this._stopSpam();
        }
    }

    /**
     * Makes the bot spam stuff
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args "stop" | [amount, [counter], ...message]
     */
    spam(bot, event, args) {
        const cleanArgs = args.trim().toLowerCase();
        
        // !spam stop
        if (cleanArgs === "stop") {
            this._stopSpam();
            return;
        }

        let [amountArg, counterArg, ...messageArg] = stringToArgs(args);
        let amount, useCounter, message = "";

        // parse amount argument (0)
        let amountParsed = parseInt(amountArg);
        if (amountParsed) {
            amount = amountParsed;
        } else {
            amount = 3;
            if (amountArg) {
                message += amountArg + " ";
            }
        }

        // parse counter argument (1)
        let counterParsed = counterArg && counterArg.toLowerCase() === "true";
        if (counterParsed) {
            useCounter = true;
        } else {
            useCounter = false;
            if (counterArg) {
                message += counterArg + " ";
            }
        }

        // add final strings to message
        message += messageArg.join(" ");

        let count = 0;
        const spamFunc = function() {
            if (useCounter) {
                bot.send(event.channelId, `**${count + 1}/${amount}:** ${message}`);
            } else {
                bot.send(event.channelId, message);
            }
            count++;
            return count < amount;
        };

        // prevent empty message from being added to que
        if (message.trim()) {
            this.spamQue.push(spamFunc);
            this._startSpam();
        }
    }

    /**
     * Throws an error
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args Error message
     */
    throw(bot, event, args) {
        throw new Error(args || "User-Thrown Error");
    }

    /**
     * Changes rich presence
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args string to set as play
     */
    play(bot, event, args) {
        bot.playGame(args);
    }

    /**
     * Tell someone something through DMs
     * @param {Bot} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args message to send
     */
    tell(bot, event, args) {
        let endTagIndex = args.match(/>/).index;
        let user = toUserId(args.slice(0, endTagIndex));
        let message = args.slice(endTagIndex + 1).trimLeft();

        bot.sendDM(user, {
            embed: {
                color: 0xF2495D,
                title: "<@" + event.userId + "> told you:",
                description: message
            }
        }, function() {
            bot.send(event.channelId, "Failed to tell <@" + user + ">");
        });
    }

    _stop() {
        this._stopSpam();
    }

    _start() {
        this._registerCommand("echo", this.echo);
        this._registerCommand("count", this.count);
        this._registerCommand("random", this.random);
        this._registerCommand("spam", this.spam);
        this._registerCommand("throw", this.throw);
        this._registerCommand("play", this.play);
        this._registerCommand("tell", this.tell);
    }
}

module.exports = Japnaa;