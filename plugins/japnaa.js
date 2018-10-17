const BotPlugin = require("../plugin.js");
const { stringToArgs } = require("../utils.js");

class Japnaa extends BotPlugin {
    constructor(bot) {
        super(bot);

        /**
         * Counter for this.count()
         */
        this.counter = 0;

        
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

        bot.send(event.channelId, this.counter.toString() + ", lol I can count!");
    }

    jap(bot, event, args) {
        bot.send(event.channelId, "**JaP is " + (args || "kewl") + "**");
    }

    tetris(bot, event, args) {
        bot.send(event.channelId, "**Tetris is a " + (args || "racing") + " game**");
    }

    echo(bot, event, args) {
        bot.send(event.channelId, args);
    }

    random(bot, event, argString) {
        const args = stringToArgs(argString);

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
            if (step) { // step is not 0
                let smin = Math.floor(min / step);
                let smax = Math.floor(max / step) + 1;
                result = step * Math.floor(smin + Math.random() * (smax - smin));
            } else { // step is 0, no step
                result = min + Math.random() * (max - min);
            }
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
        const spamFunc = function() {
            bot.send(event.channelId, args);
            return true;
        };
        this.spamQue.push(spamFunc);
        this._startSpam();
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