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

type SpamCallback = () => Promise<boolean>;

/**
 * Commonly used commands made by me, JaPNaA
 */
class Japnaa extends BotPlugin {
    counter: number;
    /** Que of spam functions */
    spamQue: { [x: string]: SpamCallback[] };
    /** Spam setInterval return */
    spamInterval: NodeJS.Timeout | null;

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
    count(event: DiscordMessageEvent): void {
        this.counter++;
        this.bot.memory.write(this.pluginName, "counter", this.counter);
        this.bot.client.send(event.channelId, this.counter.toString() + "!");
    }

    /**
     * Safe eval command
     */
    public sev(event: DiscordCommandEvent) {
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

        this._sendJSCodeBlock(event.channelId, inspect(sandbox[resultKey]));
    }


    private _sendJSCodeBlock(channelId: string, str: string) {
        const cleanStr = ellipsisize(str.replace(/ {4}/g, "\t"), 2000 - 9);
        this.bot.client.send(channelId, "```js\n" + cleanStr + "```");
    }

    /**
     * says whatever you say
     */
    async echo(event: DiscordCommandEvent) {
        let json: JSONObject | null = null;
        try {
            json = JSON.parse(event.arguments);
        } catch (err) {
            // do nothing
        }

        if (json) {
            await this.bot.client.send(event.channelId, json);
        } else {
            await this.bot.client.send(event.channelId, event.arguments);
        }
    }

    /**
     * Generates random stuff
     */
    async random(event: DiscordCommandEvent) {
        const [maxArg, minArg, stepArg, timesArg] = stringToArgs(event.arguments);

        // random string branch
        if (maxArg && maxArg.toLowerCase() === "string") {
            return this.random_string(event);
        }

        // random select branch
        if (maxArg && maxArg.toLowerCase() === "select") {
            return this.random_select(event);
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
            this.bot.client.send(event.channelId, "**Invalid arguments**");
            return;
        }
        if (min > max) {
            const temp = min;
            min = max;
            max = temp;
        }

        const results = [];
        for (let i = 0; i < times; i++) { results.push(random(min, max, step)); }

        this.bot.client.send(event.channelId,
            ellipsisize(
                `${min} to ${max} | ${step} \u2192\n**${results.join(", ")}`,
                2000 - 2
            ) + "**"
        );
    }

    private async random_string(event: DiscordCommandEvent) {
        const [stringArg, lengthArg] = stringToArgs(event.arguments);

        const length = lengthArg ? parseInt(lengthArg) : 128;
        if (isNaN(length)) {
            return this.bot.client.send(event.channelId, "Number required");
        }

        if (length > 1900) {
            return this.bot.client.send(event.channelId, "String too long (max: 1900)");
        }

        return this.bot.client.send(event.channelId,
            "```" +
            randomString(length).replace(/`$/g, "` ") // because discord markup
            + "```"
        );
    }

    private async random_select(event: DiscordCommandEvent) {
        const [selectArg, ...options] = stringToArgs(event.arguments);
        if (options.length <= 0) {
            return this.bot.client.send(event.channelId, "Supply options to choose from");
        }

        const rand = options[Math.floor(Math.random() * options.length)];

        return this.bot.client.send(event.channelId, `Select from [${options.join(", ")}]:\n**${rand}**`);
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
        const promises = [];

        for (const key of keys) {
            const spamQue: SpamCallback[] = this.spamQue[key];

            const spamFunc = spamQue.shift();
            if (spamFunc) {
                promises.push(
                    spamFunc()
                        .then(shouldContinue => {
                            if (shouldContinue) { spamQue.push(spamFunc); }
                        })
                );
            }
        }

        await Promise.all(promises);
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
    _spam(bot: Bot, channelId: string, serverId: string, amount: number, counter: boolean, message: string): void {
        let count: number = 0;
        const spamCallback: SpamCallback = async function (): Promise<boolean> {
            if (counter) {
                await bot.client.send(channelId, `**${count + 1}/${amount}:** ${message}`);
            } else {
                await bot.client.send(channelId, message);
            }
            count++;
            return count < amount;
        };

        // prevent empty message from being added to que
        if (message.trim()) {
            if (this.spamQue[serverId]) {
                this.spamQue[serverId].push(spamCallback);
            } else {
                this.spamQue[serverId] = [spamCallback];
            }
            this._startSpam();
        }
    }

    /**
     * Makes the bot spam stuff
     * @param args "stop" | [amount, [counter], ...message]
     */
    async spam_command(event: DiscordCommandEvent) {
        const args = new CommandArguments(event.arguments).parse({
            overloads: [["amount", "message"], ["message"]],
            flags: ["--count"],
            check: { "amount": /^\d$/ },
            required: ['message'],
            allowMultifinal: true
        });

        switch (args.get("message").toLowerCase()) {
            case "stop":
                this._stopSpam(event.serverId);
                this.bot.client.send(event.channelId, "All spam on this server stopped");
                return;
            case "stop all":
                if (this.bot.permissions.getPermissions_global(event.userId).has("BOT_ADMINISTRATOR")) {
                    this._stopAllSpam();
                    this.bot.client.send(event.channelId, "All spam on every server stopped");
                } else {
                    this.bot.client.send(event.channelId, mention(event.userId) + ", you don't have the permissions to do that.");
                }
                return;
            case "limit":
                this.bot.client.send(event.channelId,
                    "Your spam limit is: " + await this._getSpamLimit(event)
                );
                return;
            case "que limit":
                this.bot.client.send(event.channelId,
                    "Server que limit: " + await this._getSpamQueLimit(event)
                );
                return;
        }

        const amount = parseInt(args.get("amount")) || 3;
        const useCounter = Boolean(args.get("--count"));
        const message = args.get("message");

        const spamLimit = await this._getSpamLimit(event);
        const spamQueLimit = await this._getSpamQueLimit(event);

        if (amount > spamLimit) {
            this.bot.client.send(event.channelId, "You went over the spam limit (" + spamLimit + ")");
            return;
        }

        let server = await this.bot.client.getServer(event.serverId);
        if (!server) { throw new Error("Unknown Error"); }
        if (
            this.spamQue[server.id] &&
            this.spamQue[server.id].length + 1 > spamQueLimit
        ) {
            this.bot.client.send(event.channelId, "**Too much spam already qued.**");
            return;
        }

        this._spam(this.bot, event.channelId, event.serverId, amount, useCounter, message);
    }

    /**
     * Throws an error
     * @param args error message
     */
    throw(event: DiscordCommandEvent): void {
        throw new Error(event.arguments || "User-Thrown Error");
    }

    /**
     * Tell someone something through DMs
     * @param args message to send
     */
    tell(event: DiscordCommandEvent): void {
        let tagMatch: RegExpMatchArray | null = event.arguments.match(/^\s*<@\d+>\s*/);

        if (!tagMatch) {
            this.bot.client.send(event.channelId,
                "Invalid amount of arguments. See `" +
                event.precommandName + "help tell` for help"
            );
            return;
        }

        let user: string | null = getSnowflakeNum(tagMatch[0]);
        if (!user) {
            this.bot.client.send(event.channelId, "User does not exist.");
            return;
        }
        let message: string = event.arguments.slice(tagMatch[0].length);

        this.bot.client.sendDM(user, {
            message: mention(event.userId) + " told you",
            embed: {
                color: this.bot.config.themeColor,
                description: message
            }
        }, () => {
            this.bot.client.send(event.channelId, "Failed to tell " + mention(user as string));
        });
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
                description: "Generates a random thing. Subcommands `string` and `select` exist.",
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
    }
}

export default Japnaa;