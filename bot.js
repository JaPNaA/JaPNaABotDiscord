
const UTILS = require("./utils.js");
const FS = require("fs");

const { DiscordCommandEvent, DiscordMessageEvent } = require("./events.js");
const BotCommand = require("./botcommand.js");

class Bot {
    /**
     * Bot constructor
     * @param {Object} config bot config
     * @param {Object} memory bot memory
     * @param {Object} client client
     * @param {Function} restartFunc restarting function
     */
    constructor(config, memory, client, restartFunc) {
        /** @type {String} */
        this.id = undefined;

        /** @type {Object} */
        this.client = client;

        /** @type {Function} */
        this.restartFunc = restartFunc;

        this.config = config;
        this.memory = memory;

        /**
         * Timeout that writes memory to disk every once in a while
         * @type {NodeJS.Timeout}
         */
        this.autoWriteSI = null;
        this.autoWriteInterval = 60 * 1000; // every minute
        this.memoryChanged = false;

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

        this.autoWriteSI = setInterval(this.writeMemory.bind(this, true), this.autoWriteInterval);

        if (this.client.connected) {
            this.onready(null);
        }
    }

    stop() {
        for (let plugin of this.registeredPlugins) {
            plugin._stop();
        }

        this.writeMemory();

        clearInterval(this.autoWriteInterval);
        
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
     * @param {String|Object} message message to send
     */
    send(channelId, message) {
        console.log("send: " + message);

        if (typeof message === "string") {
            this.client.sendMessage({
                message: message,
                to: channelId,
            });
        } else if (typeof message === "object") {
            this.client.sendMessage({
                to: channelId,
                ...message
            });
        } else {
            throw new TypeError("Message is not of valid type");
        }
    }

    /**
     * Stores something in memory
     * @param {String} namespace namespace of thing to remember
     * @param {String} key key
     * @param {String|Number|Object} value value to remember
     * @param {Boolean} important write after remember?
     */
    remember(namespace, key, value, important) {
        if (!this.memory[namespace]) {
            this.memory[namespace] = {};
        }

        this.memory[namespace][key] = value;
        this.memoryChanged = true;

        if (important) {
            this.writeMemory();
        }
    }

    /**
     * Recalls something from memory
     * @param {String} namespace namespace of thing
     * @param {String} key key
     */
    recall(namespace, key) {
        if (!this.memory[namespace]) {
            return null;
        }
        if (this.memory[namespace].hasOwnProperty(key)) {
            return this.memory[namespace][key];
        } else {
            return null;
        }
    }

    /**
     * Writes memory to disk
     * @param {Boolean} [isAuto=false] is the save automatic?
     */
    writeMemory(isAuto) {
        if (isAuto && !this.memoryChanged) return;

        FS.writeFile("./memory.json", JSON.stringify(this.memory), function(e) {
            if (e) {
                console.error("Failed to write to memory", e);
                return;
            }
            console.log("Written to memory");
        });

        this.memoryChanged = false;
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