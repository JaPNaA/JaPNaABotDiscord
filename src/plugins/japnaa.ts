import BotHooks from "../bot/botHooks.js";

import { DiscordMessageEvent } from "../events.js";

import BotPlugin from "../plugin.js";
import BotCommandOptions from "../botcommandOptions.js";
import BotCommandHelp from "../botcommandHelp.js";
import Logger from "../logger.js";

import { stringToArgs, random, getSnowflakeNum } from "../utils.js";

import createKey from "../bot/locationKeyCreator.js";
import { JSONObject } from "../jsonObject.js";

/**
 * Commonly used commands made by me, JaPNaA
 */
class Japnaa extends BotPlugin {
    memorySpamLimit: string = "spamLimit";
    counter: number;
    /** Que of spam functions */
    spamQue: { [x: string]: Function[] };
    /** Spam setInterval return */
    spamInterval: NodeJS.Timeout | null;
    /** Is the spam interval active? */
    spamIntervalActive: boolean = false;
    config: JSONObject;

    constructor(bot: BotHooks) {
        super(bot);

        this._pluginName = "japnaa";
        this.memorySpamLimit = "spamLimit";
        this.counter = bot.memory.get(this._pluginName, "counter") || 0;
        this.spamQue = {};
        this.spamInterval = null;

        this.config = bot.config.getPlugin(this._pluginName) as JSONObject;
    }

    /**
     * makes the bot count
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     */
    count(bot: BotHooks, event: DiscordMessageEvent) {
        this.counter++;

        this.bot.memory.write(this._pluginName, "counter", this.counter);

        bot.send(event.channelId, this.counter.toString() + "!");
    }

    /**
     * says whatever you say
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args what to echo back
     */
    echo(bot: BotHooks, event: DiscordMessageEvent, args: string) {
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
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} argString arguments [min, max, step] | "String"
     */
    random(bot: BotHooks, event: DiscordMessageEvent, argString: string) {
        const args = stringToArgs(argString);

        // !random string
        if (args[0] && args[0].toLowerCase() == "string") {
            bot.send(event.channelId,
                "```" +
                this._randomString()
                    .replace(/`$/g, "` ") // because discord markup
                + "```"
            );
            return;
        }

        Logger.log(" >> " + JSON.stringify(args));

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
        if (this.spamInterval)
            clearInterval(this.spamInterval);

        this.spamInterval = setInterval(this._sendSpam.bind(this), 1000);
        this.spamIntervalActive = true;
    }

    /**
     * Checks if the spam interval should be running or not
     */
    _checkSpamInterval() {
        let keys = Object.keys(this.spamQue);

        for (let key of keys) {
            let que = this.spamQue[key];
            if (que.length > 0) return;
        }

        if (this.spamInterval)
            clearInterval(this.spamInterval);

        this.spamIntervalActive = false;
    }

    /**
     * Stops spamming
     * @param {String} serverId
     */
    _stopSpam(serverId: string) {
        if (this.spamQue[serverId]) {
            this.spamQue[serverId].length = 0;
        }
        this._checkSpamInterval();
    }

    /**
     * Stops all spam
     */
    _stopAllSpam() {
        if (this.spamInterval)
            clearInterval(this.spamInterval);

        this.spamIntervalActive = false;

        let keys = Object.keys(this.spamQue);
        for (let key of keys) {
            this._stopSpam(key);
        }
    }

    /**
     * Send spam, triggered by interval, by que
     */
    _sendSpam() {
        let keys = Object.keys(this.spamQue);
        for (let key of keys) {
            let spamQue = this.spamQue[key];

            if (spamQue.length) {
                let spamFunc = spamQue.shift();
                if (spamFunc && spamFunc()) {
                    spamQue.push(spamFunc);
                }
            } else {
                this._stopSpam(key);
            }
        }
    }

    /**
     * Gets the spam limit for channel and user
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     * @returns {Number} spam limit
     */
    _getSpamLimit(bot: BotHooks, event: DiscordMessageEvent): number {
        let defaultLimit = this.config["spam.defaultLimit"];

        let serverLimit = bot.memory.get(this._pluginName,
            this.memorySpamLimit + createKey.delimiter() + createKey.server(event.serverId)
        );

        let channelLimit = bot.memory.get(this._pluginName,
            this.memorySpamLimit + createKey.delimiter() + createKey.channel(event.serverId, event.channelId)
        );

        let userLimit = bot.memory.get(this._pluginName,
            this.memorySpamLimit + createKey.delimiter() + createKey.user_server(event.serverId, event.userId)
        );

        return userLimit || channelLimit || serverLimit || defaultLimit;
    }

    /**
     * Gets the spam limit que for server and user
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     */
    _getSpamQueLimit(bot: BotHooks, event: DiscordMessageEvent) {
        let defaultLimit = this.config["spam.defaultQueLimit"];

        let server = bot.getServer(event.serverId);
        if (!server) throw new Error("Unknown Error");

        let serverLimit = bot.memory.get(this._pluginName,
            this.memorySpamLimit + createKey.delimiter() + createKey.server(server.id)
        );

        return serverLimit || defaultLimit;
    }

    /**
     * Actual spam function
     * @param {BotHooks} bot bot
     * @param {String} channelId id of channel
     * @param {String} serverId id of server
     * @param {Number} amount number of messages to spam
     * @param {Boolean} counter use counter?
     * @param {String} message spam message
     */
    _spam(bot: BotHooks, channelId: string, serverId: string, amount: number, counter: boolean, message: string) {
        let count = 0;
        const spamFunc = function () {
            if (counter) {
                bot.send(channelId, `**${count + 1}/${amount}:** ${message}`);
            } else {
                bot.send(channelId, message);
            }
            count++;
            return count < amount;
        };

        // prevent empty message from being added to que
        if (message.trim()) {
            if (this.spamQue[serverId]) {
                this.spamQue[serverId].push(spamFunc);
            } else {
                this.spamQue[serverId] = [spamFunc];
            }
            this._startSpam();
        }
    }

    /**
     * Makes the bot spam stuff
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args "stop" | [amount, [counter], ...message]
     */
    spam_command(bot: BotHooks, event: DiscordMessageEvent, args: string) {
        /**
         * Arguments, cleaned
         * @type {String}
         */
        const cleanArgs: string = args.trim().toLowerCase();

        switch (cleanArgs) {
        case "stop":
            this._stopSpam(event.serverId);
            bot.send(event.channelId, "All spam on this server stopped");
            return;
        case "stop all":
            if (bot.permissions.getPermissions_global(event.userId).has("BOT_ADMINISTRATOR")) {
                this._stopAllSpam();
                bot.send(event.channelId, "All spam on every server stopped");
            } else {
                bot.send(event.channelId, "<@" + event.userId + ">, you don't have the permissions to do that.");
            }
            return;
        case "limit":
            bot.send(event.channelId,
                "Your spam limit is: " + this._getSpamLimit(bot, event)
            );
            return;
        case "que limit":
            bot.send(event.channelId,
                "Server que limit: " + this._getSpamQueLimit(bot, event)
            );
            return;
        }

        /** @type {String[]} */
        let [amountArg, counterArg, ...messageArg] = stringToArgs(args);

        /**
         * Amount of spam
         * @type {Number}
         */
        let amount: number = 0;

        /**
         * Use counter in message?
         * @type {Boolean}
         */
        let useCounter: boolean = false;

        /**
         * Message to spam
         * @type {String}
         */
        let message: string = "";

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

        // Check against limits
        // ----------------------------------------------------------------------------------------
        let spamLimit = this._getSpamLimit(bot, event);
        let spamQueLimit = this._getSpamQueLimit(bot, event);

        if (amount > spamLimit) {
            this.bot.send(event.channelId, "You went over the spam limit (" + spamLimit + ")");
            return;
        }

        let server = bot.getServer(event.serverId);
        if (!server) throw new Error("Unknown Error");
        if (
            this.spamQue[server.id] &&
            this.spamQue[server.id].length > spamQueLimit
        ) {
            this.bot.send(event.channelId, "**Too much spam already qued.**");
            return;
        }

        this._spam(bot, event.channelId, event.serverId, amount, useCounter, message);
    }

    /**
     * Throws an error
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args Error message
     */
    throw(bot: BotHooks, event: DiscordMessageEvent, args: string) {
        throw new Error(args || "User-Thrown Error");
    }

    /**
     * Changes rich presence to play a game
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args string to set as play
     */
    play(bot: BotHooks, event: DiscordMessageEvent, args: string) {
        bot.client.presence.setGame(args);
    }

    /**
     * Changes rich presence to play a game
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args string to set as play
     */
    watch(bot: BotHooks, event: DiscordMessageEvent, args: string) {
        bot.client.presence.setWatch(args);
    }

    /**
     * Changes rich presence to play a game
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args string to set as play
     */
    listen_to(bot: BotHooks, event: DiscordMessageEvent, args: string) {
        bot.client.presence.setListen(args);
    }

    /**
     * Changes rich presence to play a game
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args string to set as play
     */
    stream(bot: BotHooks, event: DiscordMessageEvent, args: string) {
        bot.client.presence.setStream(args);
    }

    /**
     * Tell someone something through DMs
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args message to send
     */
    tell(bot: BotHooks, event: DiscordMessageEvent, args: string) {
        let tagMatch = args.match(/^\s*<@\d+>\s*/);

        if (!tagMatch) {
            bot.send(event.channelId,
                "Invalid amount of arguments. See `" +
                event.precommand + "help tell` for help"
            );
            return;
        }

        let user = getSnowflakeNum(tagMatch[0]);
        if (!user) {
            bot.send(event.channelId, "User does not exist.");
            return;
        }
        let message = args.slice(tagMatch[0].length);

        bot.sendDM(user, {
            message: "<@" + event.userId + "> told you",
            embed: {
                color: bot.config.themeColor,
                description: message
            }
        }, function () {
            bot.send(event.channelId, "Failed to tell <@" + user + ">");
        });
    }

    _stop() {
        this._stopAllSpam();
    }

    _start() {
        this._registerCommand("echo", this.echo, new BotCommandOptions({
            help: new BotCommandHelp({
                description: "Says what you say, you can also echo JSON objects.",
                overloads: [{
                    "string": "Echos back what you said"
                }, {
                    "JSON string": "Parses JSON string, and echos it back. See discord.io `send` method docs for more information."
                }],
                examples: [
                    ["echo hi", "The bot will respond with \"hi\", so you're not left hanging."],
                    ["echo {\"embed\": {\"color\": 589253, \"title\": \"JSON!\", \"description\": \"JavaScript Object Notation\"}}",
                        "Responds with an embed with a cyan-ish color, the title \"JSON\", and the description \"JavaScript Object Notation\""]
                ]
            }),
            group: "Testing"
        }));

        this._registerCommand("count", this.count, new BotCommandOptions({
            help: new BotCommandHelp({
                description: "Increments a counter in the bot by 1, and sends it.",
                examples: [
                    ["count", "Will respond with a number bigger than what it reponded to the previous count count."]
                ]
            }),
            group: "Testing"
        }));

        this._registerCommand("random", this.random, new BotCommandOptions({
            help: new BotCommandHelp({
                description: "Generates a random thing",
                overloads: [{
                    "[max]": "Optional. The maximum of the random number",
                    "[min]": "Optional. The minimum of the random number",
                    "[step]": "Optional. What the number must be dividible by. 0 indicates it doesn't have to be divisible by anything."
                }, {
                    "\"string\"": "\"string\", will respond with a randomly generated 128 character string."
                }],
                examples: [
                    ["random", "A random number between 0 to 1 with no step"],
                    ["random 5", "A random number between 0 to 5 that's divisible by 1"],
                    ["random 5 10", "A random number between 5 and 10 that's divisible by 1"],
                    ["random 5 10 2", "A random number between 5 and 10 that's divisible by 2"],
                    ["random 5 10 1.6", "A random number between 5 and 10 that's divisible by 1.6"],
                    ["random string", "A random string 128 characters long"]
                ]
            }),
            group: "Utils"
        }));

        this._registerCommand("spam", this.spam_command, new BotCommandOptions({
            noDM: true,
            help: new BotCommandHelp({
                description: "Spams a message several times, because you want to be annoying.",
                overloads: [{
                    "[amount]": "Optional. The amount of spam to spam. Defaults to 3.",
                    "[use counter]": "Optional. Adds a counter to your spam. Defaults to none.",
                    "...message": "The message to spam"
                }, {
                    "\"stop\"": "Stops all spam on the server"
                }, {
                    "\"stop all\"": "Stops all spam on all servers"
                }, {
                    "\"limit\"": "Sends the spam limit for that location"
                }, {
                    "\"que limit\"": "Sends the spam que limit for that server"
                }],
                examples: [
                    ["spam cows", "Spams \"cow\" 3 times."],
                    ["spam 5 cows", "Spams \"cow\" 5 times."],
                    ["spam 5 true cows", "Adds a counter to the \"\""],
                    ["spam stop", "Stops all spam on the server"],
                    ["spam stop all", "Stops all spam on all servers (requires `BOT_ADMINISTRATOR`)"],
                    ["spam limit", "Responds with the limit of the spam of the channel"],
                    ["spam que limit", "Responds with the que limit of the channel"]
                ]
            }),
            group: "Communication"
        }));

        this._registerCommand("throw", this.throw, new BotCommandOptions({
            help: new BotCommandHelp({
                description: "Throws an error.",
                overloads: [{
                    "[errorName]": "The name of the error to throw"
                }],
                examples: [
                    ["throw", "The bot will throw a User-Throw Error"],
                    ["throw rocks", "The bot will throw the error \"rocks\""]
                ]
            }),
            group: "Testing"
        }));

        this._registerCommand("play", this.play, new BotCommandOptions({
            help: new BotCommandHelp({
                description: "Sets the \"playing\" value",
                overloads: [{
                    "value": "The \"game\" to \"play\""
                }],
                examples: [
                    ["play", "Removes the \"playing\" tag"],
                    ["play nothing", "Sets the \"playing\" tag to \"nothing\"."]
                ]
            }),
            group: "Rich Presence"
        }));
        this._registerCommand("watch", this.watch, new BotCommandOptions({
            help: new BotCommandHelp({
                description: "Sets the \"watching\" value",
                overloads: [{
                    "value": "The \"game\" to \"watch\""
                }],
                examples: [
                    ["watch", "Removes the \"watching\" tag"],
                    ["watch nothing", "Sets the \"watching\" tag to \"nothing\"."]
                ]
            }),
            group: "Rich Presence"
        }));
        this._registerCommand("listen to", this.listen_to, new BotCommandOptions({
            help: new BotCommandHelp({
                description: "Sets the \"listening\" value",
                overloads: [{
                    "value": "The \"thing\" to \"listen\" to"
                }],
                examples: [
                    ["listen to", "Removes the \"listen\" tag"],
                    ["listen to nothing", "Sets the \"listening\" tag to \"nothing\"."]
                ]
            }),
            group: "Rich Presence"
        }));
        this._registerCommand("stream", this.stream, new BotCommandOptions({
            help: new BotCommandHelp({
                description: "Sets the \"stream\" value",
                overloads: [{
                    "value": "The \"thing\" to \"stream\""
                }],
                examples: [
                    ["stream", "Removes the \"streaming\" tag"],
                    ["stream nothing", "Sets the \"streaming\" tag to \"nothing\"."]
                ]
            }),
            group: "Rich Presence"
        }));

        this._registerCommand("tell", this.tell, new BotCommandOptions({
            help: new BotCommandHelp({
                description: "The bot sends a direct message to the user, telling the user that you told them something.",
                overloads: [{
                    "user": "The userId or @mention, user to send message to.",
                    "...message": "The message to send th user above."
                }],
                examples: [
                    ["tell <@207890448159735808> hi", "The bot will send <@207890448159735808> a message, and include a not that you sent it."]
                ]
            }),
            group: "Communication"
        }));
    }
}

export default Japnaa;