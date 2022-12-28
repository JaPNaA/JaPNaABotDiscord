"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_js_1 = __importDefault(require("../main/bot/plugin/plugin.js"));
const stringToArgs_1 = __importDefault(require("../main/utils/str/stringToArgs"));
const random_1 = __importDefault(require("../main/utils/random/random"));
const getSnowflakeNum_1 = __importDefault(require("../main/utils/getSnowflakeNum"));
const locationKeyCreator_js_1 = __importDefault(require("../main/bot/utils/locationKeyCreator.js"));
const mention_1 = __importDefault(require("../main/utils/str/mention"));
const randomString_js_1 = __importDefault(require("../main/utils/random/randomString.js"));
const ellipsisize_1 = __importDefault(require("../main/utils/str/ellipsisize"));
const node_vm_1 = __importDefault(require("node:vm"));
const node_util_1 = require("node:util");
const commandArguments_1 = __importDefault(require("../main/bot/command/commandArguments"));
const fakeMessage_1 = __importDefault(require("../main/utils/fakeMessage"));
const actions_1 = require("../main/bot/actions/actions");
/**
 * Commonly used commands made by me, JaPNaA
 */
class Japnaa extends plugin_js_1.default {
    counter;
    /** Que of spam functions */
    spamQue;
    /** Spam setInterval return */
    spamInterval;
    spamAsyncStarted = 0;
    spamAsyncDone = 0;
    spamAsyncAllDoneCallback;
    /** Last-used `random` command arguments per channel */
    lastRandomCommands = new Map();
    userConfigSchema = {
        "spam.limit": {
            type: "number",
            default: 25,
            comment: "Max spam per command"
        },
        "spam.queLimit": {
            type: "number",
            default: 5,
            comment: "Max amount of spam commands running at once"
        }
    };
    constructor(bot) {
        super(bot);
        this.pluginName = "japnaa";
        this.counter = bot.memory.get(this.pluginName, "counter") || 0;
        this.spamQue = {};
        this.spamInterval = null;
    }
    /**
     * makes the bot count
     */
    *count(event) {
        this.counter++;
        this.bot.memory.write(this.pluginName, "counter", this.counter);
        return this.counter + "!";
    }
    /**
     * Safe eval command
     */
    *sev(event) {
        // Adapted from https://github.com/hacksparrow/safe-eval/blob/master/index.js
        const sandbox = {};
        const resultKey = 'SAFE_EVAL_' + Math.floor(Math.random() * 1000000);
        sandbox[resultKey] = {};
        const code = event.arguments.replace(/`/g, "\\`");
        const script = `
            (function() {
                Function = undefined;
                const keys = Object.getOwnPropertyNames(this).concat(['constructor']);
                keys.forEach((key) => {
                const item = this[key];
                if (!item || typeof item.constructor !== 'function') return;
                this[key].constructor = undefined;
                });
            })();
            with (Math) {
                ${resultKey} = eval(\`${code}\`);
            }
            `;
        node_vm_1.default.runInNewContext(script, sandbox, {
            timeout: 100
        });
        return this._JSCodeBlock((0, node_util_1.inspect)(sandbox[resultKey]));
    }
    _JSCodeBlock(str) {
        const cleanStr = (0, ellipsisize_1.default)(str.replace(/ {4}/g, "\t"), 2000 - 9);
        return "```js\n" + cleanStr + "```";
    }
    /**
     * says whatever you say
     */
    *echo(event) {
        let json = null;
        try {
            json = JSON.parse(event.arguments);
        }
        catch (err) {
            // do nothing
        }
        return json ? json : event.arguments;
    }
    /**
     * Generates random stuff
     */
    *random(event) {
        const [maxArg, minArg, stepArg, timesArg] = (0, stringToArgs_1.default)(event.arguments);
        // random again branch
        if (maxArg && maxArg.toLowerCase() === "again") {
            yield* this.random_again(event);
            return;
        }
        // don't record `random again` in history
        this.lastRandomCommands.set(event.channelId, event.arguments);
        // random string branch
        if (maxArg && maxArg.toLowerCase() === "string") {
            yield* this.random_string(event);
            return;
        }
        // random select branch
        if (maxArg && maxArg.toLowerCase() === "select") {
            yield* this.random_select(event);
            return;
        }
        let max = this._parseFloatWithDefault(maxArg, 1);
        let min = this._parseFloatWithDefault(minArg, 0);
        let step = parseFloat(stepArg);
        if (isNaN(step)) {
            step = (min === 0 && max === 1) ? 0 : 1;
        }
        const times = Math.min(parseFloat(timesArg), 700) || 1;
        // check if arguments are valid
        if (isNaN(max) || isNaN(min) || isNaN(step)) {
            yield "**Invalid arguments**";
            return;
        }
        if (min > max) {
            const temp = min;
            min = max;
            max = temp;
        }
        const results = [];
        for (let i = 0; i < times; i++) {
            results.push((0, random_1.default)(min, max, step));
        }
        yield (0, ellipsisize_1.default)(`${min} to ${max} | ${step} \u2192\n**${results.join(", ")}`, 2000 - 2) + "**";
    }
    *random_string(event) {
        const [stringArg, lengthArg] = (0, stringToArgs_1.default)(event.arguments);
        const length = lengthArg ? parseInt(lengthArg) : 128;
        if (isNaN(length)) {
            yield "Number required";
        }
        if (length > 1900) {
            yield "String too long (max: 1900)";
        }
        yield "```" +
            (0, randomString_js_1.default)(length).replace(/`$/g, "` ") // because discord markup
            + "```";
    }
    *random_select(event) {
        const [selectArg, ...options] = (0, stringToArgs_1.default)(event.arguments);
        if (options.length <= 0) {
            yield "Supply options to choose from";
            return;
        }
        const rand = options[Math.floor(Math.random() * options.length)];
        yield `Select from [${options.join(", ")}]:\n**${rand}**`;
    }
    *random_again(event) {
        const last = this.lastRandomCommands.get(event.channelId);
        if (!last) {
            yield "No previous random command";
            return;
        }
        yield* this.random({
            ...event,
            arguments: last
        });
    }
    _parseFloatWithDefault(str, defaultNum) {
        if (!str) {
            return defaultNum;
        }
        const parsed = parseFloat(str);
        if (isNaN(parsed)) {
            throw new Error("Invalid arguments: Not a number");
        }
        return parsed;
    }
    /**
     * Begins spamming from spam que with interval
     */
    _startSpam() {
        if (this.spamInterval) {
            clearInterval(this.spamInterval);
        }
        this.spamInterval = setTimeout(async () => {
            await this._sendSpam();
            this._startSpam();
        }, 1000);
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
        let keys = Object.keys(this.spamQue);
        for (let key of keys) {
            this._stopSpam(key);
        }
    }
    /**
     * Send spam, triggered by interval, by que
     */
    async _sendSpam() {
        const keys = Object.keys(this.spamQue);
        this.spamAsyncDone = this.spamAsyncStarted = 0;
        const allDone = new Promise(res => this.spamAsyncAllDoneCallback = res);
        for (const key of keys) {
            const spamQue = this.spamQue[key];
            const spamFunc = spamQue.shift();
            if (spamFunc) {
                spamFunc();
            }
        }
        await allDone;
        this._checkSpamInterval();
    }
    /**
     * Gets the spam limit for channel and user
     */
    async _getSpamLimit(event) {
        let userLimit = this.bot.memory.get(this.pluginName, "spamLimit" + locationKeyCreator_js_1.default.delimiter() + locationKeyCreator_js_1.default.user_server(event.serverId, event.userId));
        if (userLimit !== null) {
            return userLimit;
        }
        return this.config.getInChannel(event.channelId, "spam.limit");
    }
    /**
     * Gets the spam limit que for server and user
     */
    _getSpamQueLimit(event) {
        return this.config.getInChannel(event.channelId, "spam.queLimit");
    }
    /**
     * Actual spam function
     */
    _spam(bot, channelId, serverId, amount, counter, message) {
        // prevent empty message from being added to que
        if (!message.trim()) {
            return;
        }
        if (!this.spamQue[serverId]) {
            this.spamQue[serverId] = [];
        }
        this._startSpam();
        const _this = this;
        return async function* () {
            for (let count = 0; count < amount; count++) {
                _this.spamAsyncStarted++;
                if (counter) {
                    yield new actions_1.Send(channelId, `**${count + 1}/${amount}:** ${message}`);
                }
                else {
                    yield new actions_1.Send(channelId, message);
                }
                _this.spamAsyncDone++;
                if (_this.spamAsyncDone >= _this.spamAsyncStarted && _this.spamAsyncAllDoneCallback) {
                    _this.spamAsyncAllDoneCallback();
                }
                await new Promise(res => {
                    _this.spamQue[serverId].push(() => res());
                });
            }
        }();
    }
    /**
     * Makes the bot spam stuff
     * @param args "stop" | [amount, [counter], ...message]
     */
    async *spam_command(event) {
        const args = new commandArguments_1.default(event.arguments).parse({
            overloads: [["amount", "message"], ["message"]],
            flags: ["--count"],
            check: { "amount": /^\d+$/ },
            required: ['message'],
            allowMultifinal: true
        });
        switch (args.get("message").toLowerCase()) {
            case "stop":
                this._stopSpam(event.serverId);
                yield "All spam on this server stopped";
                return;
            case "stop all":
                if (this.bot.permissions.getPermissions_global(event.userId).hasCustom("BOT_ADMINISTRATOR")) {
                    this._stopAllSpam();
                    yield "All spam on every server stopped";
                }
                else {
                    yield (0, mention_1.default)(event.userId) + ", you don't have the permissions to do that.";
                }
                return;
            case "limit":
                yield "Your spam limit is: " + await this._getSpamLimit(event);
                return;
            case "que limit":
                yield "Server que limit: " + await this._getSpamQueLimit(event);
                return;
        }
        const amount = parseInt(args.get("amount")) || 3;
        const useCounter = Boolean(args.get("--count"));
        const message = args.get("message");
        const spamLimit = await this._getSpamLimit(event);
        const spamQueLimit = await this._getSpamQueLimit(event);
        if (amount > spamLimit) {
            yield "You went over the spam limit (" + spamLimit + ")";
            return;
        }
        let server = await this.bot.client.getServer(event.serverId);
        if (!server) {
            throw new Error("Unknown Error");
        }
        if (this.spamQue[server.id] &&
            this.spamQue[server.id].length + 1 > spamQueLimit) {
            yield "**Too much spam already qued.**";
            return;
        }
        const gen = this._spam(this.bot, event.channelId, event.serverId, amount, useCounter, message);
        if (gen) {
            yield* gen;
        }
    }
    /**
     * Throws an error
     * @param args error message
     */
    *throw(event) {
        throw new Error(event.arguments || "User-Thrown Error");
    }
    /**
     * Tell someone something through DMs
     * @param args message to send
     */
    async *tell(event) {
        let tagMatch = event.arguments.match(/^\s*<@\d+>\s*/);
        if (!tagMatch) {
            yield "Invalid amount of arguments. See `" +
                event.precommandName + "help tell` for help";
            return;
        }
        let user = (0, getSnowflakeNum_1.default)(tagMatch[0]);
        if (!user) {
            yield "User does not exist.";
            return;
        }
        let message = event.arguments.slice(tagMatch[0].length);
        try {
            yield new actions_1.SendPrivate(user, {
                content: (0, mention_1.default)(event.userId) + " told you",
                embeds: [{
                        color: this.bot.config.themeColor,
                        description: message
                    }]
            });
        }
        catch (err) {
            yield "Failed to tell " + (0, mention_1.default)(user);
        }
    }
    /**
     * This command has two behaviours.
     *
     * 1. With argument: Create a thread and pretend to recieve the message (defined by argument) in the thread.
     * 2. No argument: Create a thread from the last message
     */
    async *thread(event) {
        const message = event.arguments;
        if (message.trim()) {
            const thread = new actions_1.ReplyThreadSoft((0, ellipsisize_1.default)(message, 100));
            yield thread;
            this.bot.rawEventAdapter.onMessage((0, fakeMessage_1.default)({
                author: (await this.bot.client.getUser(event.userId)),
                channel: thread.getThread(),
                content: message,
                guild: (await this.bot.client.getServer(event.serverId)),
                id: event.messageId
            }));
        }
        else {
            const channel = await this.bot.client.getChannel(event.channelId);
            if (channel?.isText() && channel.lastMessage && !channel.lastMessage.hasThread) {
                yield new actions_1.ReplyThreadSoft((0, ellipsisize_1.default)(channel.lastMessage.content, 100) || "Untitled", {
                    startMessage: channel.lastMessage
                });
            }
            else {
                return new actions_1.ReplyUnimportant("You must supply a message.");
            }
        }
    }
    _stop() {
        this._stopAllSpam();
    }
    _start() {
        this._registerDefaultCommand("echo", this.echo, {
            help: {
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
            },
            group: "Testing"
        });
        this._registerDefaultCommand("count", this.count, {
            help: {
                description: "Increments a counter in the bot by 1, and sends it.",
                examples: [
                    ["count", "Will respond with a number bigger than what it reponded to the previous count count."]
                ]
            },
            group: "Testing"
        });
        this._registerDefaultCommand("random", this.random, {
            help: {
                description: "Generates a random thing. Subcommands `string`, `select` and `again` exist.",
                overloads: [{
                        "[max]": "Optional. The maximum of the random number",
                        "[min]": "Optional. The minimum of the random number",
                        "[step]": "Optional. What the number must be dividible by. 0 indicates it doesn't have to be divisible by anything.",
                        "[times]": "Optional. How many random numbers to generate"
                    }, {
                        "\"string\"": "\"string\", will respond with a randomly generated string.",
                        "[length]": "Length of random string (default is 128)."
                    }, {
                        "\"select\"": "\"select\", will respond with a randomly selected item.",
                        "<...items>": "Items to choose from. Separated by spaces."
                    }, {
                        "\"again\"": "\"again\", will rerun the previous `random` command.",
                    }],
                examples: [
                    ["random", "A random number between 0 to 1 with no step"],
                    ["random 5", "A random number between 0 to 5 that's divisible by 1"],
                    ["random 5 10", "A random number between 5 and 10 that's divisible by 1"],
                    ["random 5 10 2", "A random number between 5 and 10 that's divisible by 2"],
                    ["random 5 10 1.6", "A random number between 5 and 10 that's divisible by 1.6"],
                    ["random 5 10 1.6 10", "10 random numbers between 5 and 10 that's divisible by 1.6"],
                    ["random string", "A random string 128 characters long"],
                    ["random string 10", "A random string 10 characters long"],
                    ["random select a b c", "Selects one of a, b, or c randomly"],
                    ["random again", "repeats the previous `random` command"]
                ]
            },
            group: "Utils"
        });
        this._registerDefaultCommand("spam", this.spam_command, {
            noDM: true,
            help: {
                description: "Spams a message several times, because you want to be annoying.",
                overloads: [{
                        "[amount]": "Optional. The amount of spam to spam. Defaults to 3.",
                        "--count": "Flag. Adds a counter to your spam.",
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
                    ["spam 5 --counter cows", "Adds a counter to the \"\""],
                    ["spam stop", "Stops all spam on the server"],
                    ["spam stop all", "Stops all spam on all servers (requires `BOT_ADMINISTRATOR`)"],
                    ["spam limit", "Responds with the limit of the spam of the channel"],
                    ["spam que limit", "Responds with the que limit of the channel"]
                ]
            },
            group: "Communication"
        });
        this._registerDefaultCommand("throw", this.throw, {
            help: {
                description: "Throws an error.",
                overloads: [{
                        "[errorName]": "The name of the error to throw"
                    }],
                examples: [
                    ["throw", "The bot will throw a User-Throw Error"],
                    ["throw rocks", "The bot will throw the error \"rocks\""]
                ]
            },
            group: "Testing"
        });
        this._registerDefaultCommand("tell", this.tell, {
            help: {
                description: "The bot sends a direct message to the user, telling the user that you told them something.",
                overloads: [{
                        "user": "The userId or @mention, user to send message to.",
                        "...message": "The message to send th user above."
                    }],
                examples: [
                    ["tell <@207890448159735808> hi", "The bot will send <@207890448159735808> a message, and include a not that you sent it."]
                ]
            },
            group: "Communication"
        });
        this._registerDefaultCommand("sev", this.sev, {
            help: {
                description: "`eval` in a sandbox. Useful for doing math.",
                examples: [
                    ["sev 1 + 1", "Evaluate 1 + 1 (and returns 2)"],
                    ["sev log(2)", "Evaluates log (base 10) 2"],
                    ["sev 2 ** 2", "Evaluates 2^2"],
                    ["sev let total = 0; for (let i = 0; i < 100; i++) { total += i; } total", "Sum all integers from 0 to 99"]
                ]
            }
        });
        const precommand = this.bot.precommandManager.precommands[0].names[0] || "!";
        this._registerDefaultCommand("thread", this.thread, {
            help: {
                description: "This command has two behaviours. (1) Creates a thread with your message as the title. If your message is a command, the bot acts as if you sent that message in the thread. (2) If your message is empty, the bot will create a thread from the last message.",
                examples: [
                    [`thread ${precommand}echo a`, `Creates a thread with title "${precommand}echo a" then, the bot will send "a" in the thread`],
                    ["thread", "Creates a thread from the last message in the channel. *Only useful when used as a slash command.* (Does nothing if already in thread.)"]
                ]
            }
        });
    }
}
exports.default = Japnaa;
