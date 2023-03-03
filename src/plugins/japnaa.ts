import DiscordMessageEvent from "../main/bot/events/discordCommandEvent";

import BotPlugin from "../main/bot/plugin/plugin.js";

import stringToArgs from "../main/utils/str/stringToArgs";
import random from "../main/utils/random/random";
import getSnowflakeNum from "../main/utils/getSnowflakeNum";

import createKey from "../main/bot/utils/locationKeyCreator.js";
import { JSONObject } from "../main/types/jsonObject.js";
import mention from "../main/utils/str/mention"
import randomString from "../main/utils/random/randomString.js";
import Bot from "../main/bot/bot/bot";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent";
import ellipsisize from "../main/utils/str/ellipsisize";

import vm from "node:vm";
import { inspect } from "node:util";
import CommandArguments from "../main/bot/command/commandArguments";
import fakeMessage from "../main/utils/fakeMessage";
import { Action, ReplyThreadSoft, ReplyUnimportant, Send, SendPrivate } from "../main/bot/actions/actions";
import { TextChannel } from "discord.js";

type SpamCallback = () => void;

/**
 * Commonly used commands made by me, JaPNaA
 */
class Japnaa extends BotPlugin {
    counter: number;
    /** Que of spam functions */
    spamQue: { [x: string]: SpamCallback[] };
    /** Spam setInterval return */
    spamInterval: NodeJS.Timeout | null;
    spamAsyncStarted = 0;
    spamAsyncDone = 0;
    spamAsyncAllDoneCallback?: Function;

    /** Last-used `random` command arguments per channel */
    lastRandomCommands: Map<string, string> = new Map();

    public userConfigSchema = {
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
    }

    constructor(bot: Bot) {
        super(bot);

        this.pluginName = "japnaa";
        this.counter = bot.memory.get(this.pluginName, "counter") || 0;
        this.spamQue = {};
        this.spamInterval = null;
    }

    /**
     * makes the bot count
     */
    *count(event: DiscordMessageEvent) {
        this.counter++;
        this.bot.memory.write(this.pluginName, "counter", this.counter);
        return this.counter + "!";
    }

    /**
     * Safe eval command
     */
    public *sev(event: DiscordCommandEvent) {
        // Adapted from https://github.com/hacksparrow/safe-eval/blob/master/index.js
        const sandbox: { [x: string]: any } = {}
        const resultKey = 'SAFE_EVAL_' + Math.floor(Math.random() * 1000000)
        sandbox[resultKey] = {}
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
        vm.runInNewContext(script, sandbox, {
            timeout: 100
        });

        return this._JSCodeBlock(inspect(sandbox[resultKey]));
    }


    private _JSCodeBlock(str: string) {
        const cleanStr = ellipsisize(str.replace(/ {4}/g, "\t"), 2000 - 9);
        return "```js\n" + cleanStr + "```";
    }

    /**
     * says whatever you say
     */
    *echo(event: DiscordCommandEvent) {
        let json: JSONObject | null = null;
        try {
            json = JSON.parse(event.arguments);
        } catch (err) {
            // do nothing
        }

        return json ? json : event.arguments;
    }

    /**
     * Generates random stuff
     */
    *random(event: DiscordCommandEvent): Generator<string> {
        const [maxArg, minArg, stepArg, timesArg] = stringToArgs(event.arguments);

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
        for (let i = 0; i < times; i++) { results.push(random(min, max, step)); }

        yield ellipsisize(
            `${min} to ${max} | ${step} \u2192\n**${results.join(", ")}`,
            2000 - 2
        ) + "**";
    }

    private *random_string(event: DiscordCommandEvent) {
        const [stringArg, lengthArg] = stringToArgs(event.arguments);

        const length = lengthArg ? parseInt(lengthArg) : 128;
        if (isNaN(length)) {
            yield "Number required";
        }

        if (length > 1900) {
            yield "String too long (max: 1900)";
        }

        yield "```" +
            randomString(length).replace(/`$/g, "` ") // because discord markup
            + "```";
    }

    private *random_select(event: DiscordCommandEvent) {
        const [selectArg, ...options] = stringToArgs(event.arguments);
        if (options.length <= 0) {
            yield "Supply options to choose from";
            return;
        }

        const rand = options[Math.floor(Math.random() * options.length)];

        yield `Select from [${options.join(", ")}]:\n**${rand}**`;
    }

    private *random_again(event: DiscordCommandEvent) {
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

    private _parseFloatWithDefault(str: string, defaultNum: number) {
        if (!str) { return defaultNum; }
        const parsed = parseFloat(str);
        if (isNaN(parsed)) { throw new Error("Invalid arguments: Not a number"); }
        return parsed;
    }

    /**
     * Begins spamming from spam que with interval
     */
    _startSpam(): void {
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
    _checkSpamInterval(): void {
        let keys: string[] = Object.keys(this.spamQue);

        for (let key of keys) {
            let que: SpamCallback[] = this.spamQue[key];
            if (que.length > 0) { return; }
        }

        if (this.spamInterval) {
            clearInterval(this.spamInterval);
        }
    }

    /**
     * Stops spamming
     */
    _stopSpam(serverId: string): void {
        if (this.spamQue[serverId]) {
            this.spamQue[serverId].length = 0;
        }
        this._checkSpamInterval();
    }

    /**
     * Stops all spam
     */
    _stopAllSpam(): void {
        if (this.spamInterval) {
            clearInterval(this.spamInterval);
        }

        let keys: string[] = Object.keys(this.spamQue);
        for (let key of keys) {
            this._stopSpam(key);
        }
    }

    /**
     * Send spam, triggered by interval, by que
     */
    async _sendSpam() {
        const keys: string[] = Object.keys(this.spamQue);

        this.spamAsyncDone = this.spamAsyncStarted = 0;
        const allDone = new Promise(res => this.spamAsyncAllDoneCallback = res);

        for (const key of keys) {
            const spamQue: SpamCallback[] = this.spamQue[key];

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
    async _getSpamLimit(event: DiscordMessageEvent): Promise<number> {
        let userLimit: number = this.bot.memory.get(this.pluginName,
            "spamLimit" + createKey.delimiter() + createKey.user_server(event.serverId, event.userId)
        );
        if (userLimit !== null) { return userLimit; }

        return this.config.getInChannel(event.channelId, "spam.limit");
    }

    /**
     * Gets the spam limit que for server and user
     */
    _getSpamQueLimit(event: DiscordMessageEvent): Promise<number> {
        return this.config.getInChannel(event.channelId, "spam.queLimit");
    }

    /**
     * Actual spam function
     */
    _spam(bot: Bot, channelId: string, serverId: string, amount: number, counter: boolean, message: string): AsyncGenerator<Action> | undefined {
        // prevent empty message from being added to que
        if (!message.trim()) { return; }

        if (!this.spamQue[serverId]) {
            this.spamQue[serverId] = [];
        }
        this._startSpam();

        const _this = this;
        return async function* (): AsyncGenerator<Action> {
            for (let count = 0; count < amount; count++) {
                _this.spamAsyncStarted++;

                if (counter) {
                    yield new Send(channelId, `**${count + 1}/${amount}:** ${message}`);
                } else {
                    yield new Send(channelId, message);
                }

                _this.spamAsyncDone++;
                if (_this.spamAsyncDone >= _this.spamAsyncStarted && _this.spamAsyncAllDoneCallback) {
                    _this.spamAsyncAllDoneCallback();
                }

                await new Promise<void>(res => {
                    _this.spamQue[serverId].push(() => res())
                });
            }
        }();

    }

    /**
     * Makes the bot spam stuff
     * @param args "stop" | [amount, [counter], ...message]
     */
    async *spam_command(event: DiscordCommandEvent) {
        const args = new CommandArguments(event.arguments).parse({
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
                } else {
                    yield mention(event.userId) + ", you don't have the permissions to do that.";
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
        if (!server) { throw new Error("Unknown Error"); }
        if (
            this.spamQue[server.id] &&
            this.spamQue[server.id].length + 1 > spamQueLimit
        ) {
            yield "**Too much spam already qued.**";
            return;
        }

        const gen = this._spam(this.bot, event.channelId, event.serverId, amount, useCounter, message);
        if (gen) { yield* gen; }
    }

    /**
     * Throws an error
     * @param args error message
     */
    *throw(event: DiscordCommandEvent) {
        throw new Error(event.arguments || "User-Thrown Error");
    }

    /**
     * Tell someone something through DMs
     * @param args message to send
     */
    async *tell(event: DiscordCommandEvent) {
        let tagMatch: RegExpMatchArray | null = event.arguments.match(/^\s*<@\d+>\s*/);

        if (!tagMatch) {
            yield "Invalid amount of arguments. See `" +
                event.precommandName + "help tell` for help";
            return;
        }

        let user: string | null = getSnowflakeNum(tagMatch[0]);
        if (!user) {
            yield "User does not exist.";
            return;
        }
        let message: string = event.arguments.slice(tagMatch[0].length);

        try {
            yield new SendPrivate(user, {
                content: mention(event.userId) + " told you",
                embeds: [{
                    color: this.bot.config.themeColor,
                    description: message
                }]
            });
        } catch (err) {
            yield "Failed to tell " + mention(user as string);
        }
    }

    /**
     * This command has two behaviours.
     * 
     * 1. With argument: Create a thread and pretend to recieve the message (defined by argument) in the thread.
     * 2. No argument: Create a thread from the last message
     */
    async *thread(event: DiscordCommandEvent) {
        const message = event.arguments;

        if (message.trim()) {
            const thread = new ReplyThreadSoft(ellipsisize(message, 100));
            yield thread;

            this.bot.rawEventAdapter.onMessage(fakeMessage({
                author: (await this.bot.client.getUser(event.userId))!,
                channel: thread.getThread(),
                content: message,
                guild: (await this.bot.client.getServer(event.serverId))!,
                id: event.messageId
            }));
        } else {
            const channel = await this.bot.client.getChannel(event.channelId);
            if (channel?.isTextBased() && 'lastMessage' in channel && channel.lastMessage && !channel.lastMessage.hasThread) {
                yield new ReplyThreadSoft(ellipsisize(channel.lastMessage.content, 100) || "Untitled", {
                    startMessage: channel.lastMessage
                });
            } else {
                return new ReplyUnimportant("You must supply a message.");
            }
        }
    }

    /**
     * Recieves each message in a command separately
     */
    async *multi(event: DiscordCommandEvent) {
        let args = event.arguments.split("\n");
        if (args.length === 1) {
            args = event.arguments.split(/;\s+/g);
        }

        for (const submessage of args) {
            if (!submessage.trim()) { continue; }

            this.bot.rawEventAdapter.onMessage(fakeMessage({
                author: (await this.bot.client.getUser(event.userId))!,
                channel: (await this.bot.client.getChannel(event.channelId)) as TextChannel,
                content: submessage,
                guild: (await this.bot.client.getServer(event.serverId))!,
                id: event.messageId
            }));
        }
    }

    _stop(): void {
        this._stopAllSpam();
    }

    _start(): void {
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

        this._registerDefaultCommand("multi", this.multi, {
            help: {
                description: "Treats each line in the argument as a separate message (treats ';' as a line separator if there are no new lines).",
                examples: [
                    [`multi ${precommand}echo a\n${precommand}echo b`, "Tells the bot to say 'a', then 'b'"],
                    [`multi ${precommand}echo a; ${precommand}echo b`, "Tells the bot to say 'a', then 'b'"]
                ]
            }
        });
    }
}

export default Japnaa;