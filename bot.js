
const UTILS = require("./utils.js");

const { DiscordCommandEvent, DiscordMessageEvent } = require("./events.js");
const BotCommand = require("./botcommand.js");

class Bot {
    /**
     * Bot constructor
     * @param {Object} config bot config
     * @param {Object} client client
     * @param {Function} restartFunc restarting function
     */
    constructor(config, client, restartFunc) {
        /** @type {String} */
        this.id = undefined;

        /** @type {Object} */
        this.client = client;

        /** @type {Function} */
        this.restartFunc = restartFunc;

        this.config = config;

        /**
         * @type {BotCommand[]} list of commands registered
         */
        this.registeredCommands = [];

        /**
         * @type {Array} list of plugins registered
         */
        this.registeredPlugins = [];

        this.start();
    }

    start() {
        console.log("Bot starting...");

        this.registerCommand("restart", this.restart);

        if (this.client.connected) {
            this.onready(null);
        }
    }

    stop() {
        for (let plugin of this.registeredPlugins) {
            plugin._stop();
        }
        
        this.registeredCommands.length = 0;
        this.registeredPlugins.length = 0;
    }

    /**
     * Restarts bot on command
     * @param {Bot} bot this
     * @param {DiscordMessageEvent} event data
     * @param {String} args arguments as string
     */
    restart(bot, event, args) {
        bot.send(event.channelId, "**Restarting**");
        console.log("Restarting");
        bot.stop();
        bot.restartFunc();
    }

    /**
     * register bot plugin
     * @param {*} plugin plugin
     */
    registerPlugin(plugin) {
        plugin._start();

        this.registeredPlugins.push(plugin);
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
        console.log("send: " + message);
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
        console.log("Started");
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

        console.log("message: " + message);

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