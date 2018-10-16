const FS = require("fs"); 
const ENV = require("./readenv.js")();
const DISCORD = require("discord.io");
const UTILS = require("./utils.js");

const { DiscordCommandEvent, DiscordMessageEvent } = require("./events.js");
const BotCommand = require("./botcommand.js");

class Bot {
    constructor() {
        const client = new DISCORD.Client({
            token: ENV.token,
            autorun: true
        });

        /** @type {String} */
        this.id = undefined;

        /** @type {DISCORD.Client} */
        this.client = client;

        this.config = JSON.parse(FS.readFileSync("./config.json").toString());

        /**
         * @type {BotCommand[]} list of commands registered
         */
        this.registeredCommands = [];

        this.setup();
    }

    setup() {
        this.client.on("ready", event => this.onready(event));
        this.client.on("message", (user, userId, channelId, message, event) => this.onmessage(user, userId, channelId, message, event));
    }

    registerCommand(triggerWord, func) {
        this.registeredCommands.push(new BotCommand(this, triggerWord, func));
    }

    /**
     * Send message
     * @param {String} channelId channel id
     * @param {String} message message to send
     */
    send(channelId, message) {
        this.client.sendMessage({
            message: message,
            to: channelId
        });
    }

    /**
     * ready callback
     * @param {*} event webscoket event
     */
    onready(event) {
        this.id = this.client.id;
    }

    /**
     * onmessage callback
     * @param {String} username of sender
     * @param {String} userId of sender
     * @param {String} channelId in
     * @param {String} message sent
     * @param {*} event websocket event
     */
    onmessage(username, userId, channelId, message, event) {
        if (userId == this.id) return;

        const messageEvent = new DiscordMessageEvent(username, userId, channelId, message, event);

        let precommandUsed = UTILS.startsWithAny(message, this.config["bot.precommand"]);
        if (precommandUsed) {
            this.oncommand(messageEvent, precommandUsed, message.slice(precommandUsed.length));
        }
    }

    /**
     * called on command by onmessage
     * @param {DiscordMessageEvent} messageEvent message information
     * @param {String} pre what bot.precommand was used
     * @param {String} commandStr message, without precommand
     */
    oncommand(messageEvent, pre, commandStr) {
        const commandEvent = new DiscordCommandEvent(messageEvent, pre, commandStr);

        const firstWhiteSpaceMatch = commandStr.match(/\s/);
        if (firstWhiteSpaceMatch) {
            const firstWhiteSpaceIndex = firstWhiteSpaceMatch.index;
            const commandWord = commandStr.slice(0, firstWhiteSpaceIndex).toLowerCase();
            const argString = commandStr.slice(firstWhiteSpaceIndex + 1);

            for (let command of this.registeredCommands) {
                command.testAndRun(commandEvent, commandWord, argString);
            }
        } else {
            const commandWord = commandStr.toLowerCase();
            const argString = "";
            
            for (let command of this.registeredCommands) {
                command.testAndRun(commandEvent, commandWord, argString);
            }
        }
    }
}

module.exports = Bot;