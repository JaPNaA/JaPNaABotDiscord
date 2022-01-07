"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_js_1 = __importDefault(require("../main/bot/plugin/plugin.js"));
const commandOptions_js_1 = __importDefault(require("../main/bot/command/commandOptions.js"));
const commandHelp_js_1 = __importDefault(require("../main/bot/command/commandHelp.js"));
const logger_js_1 = __importDefault(require("../main/utils/logger.js"));
const stringToArgs_1 = __importDefault(require("../main/utils/str/stringToArgs"));
const random_1 = __importDefault(require("../main/utils/random/random"));
const getSnowflakeNum_1 = __importDefault(require("../main/utils/getSnowflakeNum"));
const locationKeyCreator_js_1 = __importDefault(require("../main/bot/utils/locationKeyCreator.js"));
const mention_1 = __importDefault(require("../main/utils/str/mention"));
const randomString_js_1 = __importDefault(require("../main/utils/random/randomString.js"));
/**
 * Commonly used commands made by me, JaPNaA
 */
class Japnaa extends plugin_js_1.default {
    constructor(bot) {
        super(bot);
        this.memorySpamLimit = "spamLimit";
        /** Is the spam interval active? */
        this.spamIntervalActive = false;
        this._pluginName = "japnaa";
        this.memorySpamLimit = "spamLimit";
        this.counter = bot.memory.get(this._pluginName, "counter") || 0;
        this.spamQue = {};
        this.spamInterval = null;
        this.config = bot.config.getPlugin(this._pluginName); // assume config is correct
    }
    /**
     * makes the bot count
     */
    count(event) {
        this.counter++;
        this.bot.memory.write(this._pluginName, "counter", this.counter);
        this.bot.client.send(event.channelId, this.counter.toString() + "!");
    }
    /**
     * says whatever you say
     */
    async echo(event) {
        let json = null;
        try {
            json = JSON.parse(event.arguments);
        }
        catch (err) {
            // do nothing
        }
        if (json) {
            await this.bot.client.send(event.channelId, json);
        }
        else {
            await this.bot.client.send(event.channelId, event.arguments);
        }
    }
    /**
     * Generates random stuff
     */
    random(event) {
        const args = stringToArgs_1.default(event.arguments);
        // !random string
        if (args[0] && args[0].toLowerCase() === "string") {
            this.bot.client.send(event.channelId, "```" +
                randomString_js_1.default(128).replace(/`$/g, "` ") // because discord markup
                + "```");
            return;
        }
        logger_js_1.default.log(" >> " + JSON.stringify(args));
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
            this.bot.client.send(event.channelId, "**Invalid arguments**");
        }
        else {
            result = random_1.default(min, max, step);
        }
        this.bot.client.send(event.channelId, `${min} - ${max} | ${step} \u2192\n**${result}**`);
    }
    /**
     * Begins spamming from spam que with interval
     */
    _startSpam() {
        if (this.spamIntervalActive) {
            return;
        }
        if (this.spamInterval) {
            clearInterval(this.spamInterval);
        }
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
            if (que.length > 0) {
                return;
            }
        }
        if (this.spamInterval) {
            clearInterval(this.spamInterval);
        }
        this.spamIntervalActive = false;
    }
    /**
     * Stops spamming
     */
    _stopSpam(serverId) {
        if (this.spamQue[serverId]) {
            this.spamQue[serverId].length = 0;
        }
        this._checkSpamInterval();
    }
    /**
     * Stops all spam
     */
    _stopAllSpam() {
        if (this.spamInterval) {
            clearInterval(this.spamInterval);
        }
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
            }
            else {
                this._stopSpam(key);
            }
        }
    }
    /**
     * Gets the spam limit for channel and user
     */
    _getSpamLimit(bot, event) {
        let userLimit = bot.memory.get(this._pluginName, this.memorySpamLimit + locationKeyCreator_js_1.default.delimiter() + locationKeyCreator_js_1.default.user_server(event.serverId, event.userId));
        if (userLimit !== null) {
            return userLimit;
        }
        let channelLimit = bot.memory.get(this._pluginName, this.memorySpamLimit + locationKeyCreator_js_1.default.delimiter() + locationKeyCreator_js_1.default.channel(event.serverId, event.channelId));
        if (channelLimit !== null) {
            return channelLimit;
        }
        let serverLimit = bot.memory.get(this._pluginName, this.memorySpamLimit + locationKeyCreator_js_1.default.delimiter() + locationKeyCreator_js_1.default.server(event.serverId));
        if (serverLimit !== null) {
            return serverLimit;
        }
        let defaultLimit = this.config["spam.defaultLimit"];
        return defaultLimit;
    }
    /**
     * Gets the spam limit que for server and user
     */
    async _getSpamQueLimit(bot, event) {
        let defaultLimit = this.config["spam.defaultQueLimit"];
        let server = await bot.client.getServer(event.serverId);
        if (!server) {
            throw new Error("Unknown Error");
        }
        let serverLimit = bot.memory.get(this._pluginName, this.memorySpamLimit + locationKeyCreator_js_1.default.delimiter() + locationKeyCreator_js_1.default.server(server.id));
        return serverLimit || defaultLimit;
    }
    /**
     * Actual spam function
     */
    _spam(bot, channelId, serverId, amount, counter, message) {
        let count = 0;
        const spamCallback = function () {
            if (counter) {
                bot.client.send(channelId, `**${count + 1}/${amount}:** ${message}`);
            }
            else {
                bot.client.send(channelId, message);
            }
            count++;
            return count < amount;
        };
        // prevent empty message from being added to que
        if (message.trim()) {
            if (this.spamQue[serverId]) {
                this.spamQue[serverId].push(spamCallback);
            }
            else {
                this.spamQue[serverId] = [spamCallback];
            }
            this._startSpam();
        }
    }
    /**
     * Makes the bot spam stuff
     * @param args "stop" | [amount, [counter], ...message]
     */
    async spam_command(event) {
        const cleanArgs = event.arguments.trim().toLowerCase();
        switch (cleanArgs) {
            case "stop":
                this._stopSpam(event.serverId);
                this.bot.client.send(event.channelId, "All spam on this server stopped");
                return;
            case "stop all":
                if (this.bot.permissions.getPermissions_global(event.userId).has("BOT_ADMINISTRATOR")) {
                    this._stopAllSpam();
                    this.bot.client.send(event.channelId, "All spam on every server stopped");
                }
                else {
                    this.bot.client.send(event.channelId, mention_1.default(event.userId) + ", you don't have the permissions to do that.");
                }
                return;
            case "limit":
                this.bot.client.send(event.channelId, "Your spam limit is: " + this._getSpamLimit(this.bot, event));
                return;
            case "que limit":
                this.bot.client.send(event.channelId, "Server que limit: " + this._getSpamQueLimit(this.bot, event));
                return;
        }
        let [amountArg, counterArg, ...messageArg] = stringToArgs_1.default(event.arguments);
        /**
         * Amount of spam
         */
        let amount = 0;
        /**
         * Use counter in message?
         */
        let useCounter = false;
        /**
         * Message to spam
         */
        let message = "";
        // parse amount argument (0)
        let amountParsed = parseInt(amountArg);
        if (amountParsed) {
            amount = amountParsed;
        }
        else {
            amount = 3;
            if (amountArg) {
                message += amountArg + " ";
            }
        }
        // parse counter argument (1)
        let counterParsed = Boolean(counterArg) && counterArg.toLowerCase() === "true";
        if (counterParsed) {
            useCounter = true;
        }
        else {
            useCounter = false;
            if (counterArg) {
                message += counterArg + " ";
            }
        }
        // add final strings to message
        message += messageArg.join(" ");
        // check against limits
        // ----------------------------------------------------------------------------------------
        let spamLimit = this._getSpamLimit(this.bot, event);
        let spamQueLimit = await this._getSpamQueLimit(this.bot, event);
        if (amount > spamLimit) {
            this.bot.client.send(event.channelId, "You went over the spam limit (" + spamLimit + ")");
            return;
        }
        let server = await this.bot.client.getServer(event.serverId);
        if (!server) {
            throw new Error("Unknown Error");
        }
        if (this.spamQue[server.id] &&
            this.spamQue[server.id].length > spamQueLimit) {
            this.bot.client.send(event.channelId, "**Too much spam already qued.**");
            return;
        }
        this._spam(this.bot, event.channelId, event.serverId, amount, useCounter, message);
    }
    /**
     * Throws an error
     * @param args error message
     */
    throw(event) {
        throw new Error(event.arguments || "User-Thrown Error");
    }
    /**
     * Changes rich presence to play a game
     * @param args string to set as play
     */
    play(event) {
        this.bot.client.presence.setGame(event.arguments);
    }
    /**
     * Changes rich presence to watch a game
     * @param args string to set as watch
     */
    watch(event) {
        this.bot.client.presence.setWatch(event.arguments);
    }
    /**
     * Changes rich presence to listen to a music
     * @param args string to set as music
     */
    listen_to(event) {
        this.bot.client.presence.setListen(event.arguments);
    }
    /**
     * Changes rich presence to stream a game
     * @param args string to set as stream
     */
    stream(event) {
        this.bot.client.presence.setStream(event.arguments);
    }
    /**
     * Tell someone something through DMs
     * @param args message to send
     */
    tell(event) {
        let tagMatch = event.arguments.match(/^\s*<@\d+>\s*/);
        if (!tagMatch) {
            this.bot.client.send(event.channelId, "Invalid amount of arguments. See `" +
                event.precommandName + "help tell` for help");
            return;
        }
        let user = getSnowflakeNum_1.default(tagMatch[0]);
        if (!user) {
            this.bot.client.send(event.channelId, "User does not exist.");
            return;
        }
        let message = event.arguments.slice(tagMatch[0].length);
        this.bot.client.sendDM(user, {
            message: mention_1.default(event.userId) + " told you",
            embed: {
                color: this.bot.config.themeColor,
                description: message
            }
        }, () => {
            this.bot.client.send(event.channelId, "Failed to tell " + mention_1.default(user));
        });
    }
    _stop() {
        this._stopAllSpam();
    }
    _start() {
        this._registerDefaultCommand("echo", this.echo, new commandOptions_js_1.default({
            help: new commandHelp_js_1.default({
                description: "Says what you say, you can also echo JSON objects.",
                overloads: [{
                        "string": "Echos back what you said"
                    }, {
                        "JSON string": "Parses JSON string, and echos it back. See discord.io `send` method docs for more information."
                    }],
                examples: [
                    ["echo hi", "The bot will respond with \"hi\", so you're not left hanging."],
                    [
                        "echo {\"embeds\": [{\"color\": 589253, \"title\": \"JSON!\", \"description\": \"JavaScript Object Notation\"}]}",
                        "Responds with an embed with a cyan-ish color, the title \"JSON\", and the description" +
                            "\"JavaScript Object Notation\""
                    ]
                ]
            }),
            group: "Testing"
        }));
        this._registerDefaultCommand("count", this.count, new commandOptions_js_1.default({
            help: new commandHelp_js_1.default({
                description: "Increments a counter in the bot by 1, and sends it.",
                examples: [
                    ["count", "Will respond with a number bigger than what it reponded to the previous count count."]
                ]
            }),
            group: "Testing"
        }));
        this._registerDefaultCommand("random", this.random, new commandOptions_js_1.default({
            help: new commandHelp_js_1.default({
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
        this._registerDefaultCommand("spam", this.spam_command, new commandOptions_js_1.default({
            noDM: true,
            help: new commandHelp_js_1.default({
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
        this._registerDefaultCommand("throw", this.throw, new commandOptions_js_1.default({
            help: new commandHelp_js_1.default({
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
        this._registerDefaultCommand("play", this.play, new commandOptions_js_1.default({
            help: new commandHelp_js_1.default({
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
        this._registerDefaultCommand("watch", this.watch, new commandOptions_js_1.default({
            help: new commandHelp_js_1.default({
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
        this._registerDefaultCommand("listen to", this.listen_to, new commandOptions_js_1.default({
            help: new commandHelp_js_1.default({
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
        this._registerDefaultCommand("stream", this.stream, new commandOptions_js_1.default({
            help: new commandHelp_js_1.default({
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
        this._registerDefaultCommand("tell", this.tell, new commandOptions_js_1.default({
            help: new commandHelp_js_1.default({
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
exports.default = Japnaa;
