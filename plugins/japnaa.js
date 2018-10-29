const BotPlugin = require("../plugin.js");
const { stringToArgs, random } = require("../utils.js");

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

    count(bot, event, args) {
        this.counter++;

        this.bot.remember(this.namespace, "counter", this.counter);

        bot.send(event.channelId, this.counter.toString() + "!");
    }

    jap(bot, event, args) {
        bot.send(event.channelId, {
            embed: {
                color: 0xF2495D,
                description: "**JaP is " + (args || "kewl") + "**"
            }
        });
    }

    tetris(bot, event, args) {
        bot.send(event.channelId, "**Tetris is a " + (args || "racing") + " game**");
    }

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

    _randomString() {
        const min = 32, max = 127;
        let rands = [];

        for (let i = 0; i < 128; i++) {
            rands.push(random(min, max, 1));
        }

        return String.fromCharCode(...rands);
    }

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

    _startSpam() {
        if (this.spamIntervalActive) return;
        clearInterval(this.spamInterval);
        this.spamInterval = setInterval(this._sendSpam.bind(this), 1000);
        this.spamIntervalActive = true;
    }
    
    _stopSpam() {
        clearInterval(this.spamInterval);
        this.spamQue.length = 0;
        this.spamIntervalActive = false;
    }

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

    throw(bot, event, args) {
        throw new Error(args || "User-Thrown Error");
    }

    _stop() {
        this._stopSpam();
    }

    _start() {
        this._registerCommand("echo", this.echo);
        this._registerCommand("jap", this.jap);
        this._registerCommand("tetris", this.tetris);
        this._registerCommand("count", this.count);
        this._registerCommand("random", this.random);
        this._registerCommand("spam", this.spam);
        this._registerCommand("throw", this.throw);
    }
}

module.exports = Japnaa;