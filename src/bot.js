/**
 * @typedef {import("discord.io").Client} Client;
 */

const UTILS = require("./utils.js");
const FS = require("fs");
const Permissions = require("./permissions.js");

const { DiscordCommandEvent, DiscordMessageEvent } = require("./events.js");
const BotCommand = require("./botcommand.js");

class Bot {
    /**
     * Bot constructor
     * @param {Object} config bot config
     * @param {Object} memory bot memory
     * @param {String} memoryPath path to memory
     * @param {Client} client client
     * @param {Function} restartFunc restarting function
     */
    constructor(config, memory, memoryPath, client, restartFunc) {
        /** @type {String} */
        this.id = undefined;

        /** @type {Client} */
        this.client = client;

        /** @type {Function} */
        this.restartFunc = restartFunc;

        this.config = config;

        /** 
         * Path to memory
         * @type {String} 
         */
        this.memoryPath = memoryPath;
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
            this.onready();
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
     */
    restart(bot, event) {
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
        console.log(">>", message);

        for (let plugin of this.registeredPlugins) {
            plugin._dispatchEvent("send", message);
        }

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
     * @param {Boolean} [important=false] write after remember?
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

        for (let plugin of this.registeredPlugins) {
            plugin._dispatchEvent("beforememorywrite", null);
        }

        FS.writeFile(this.memoryPath, JSON.stringify(this.memory), function(e) {
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
     */
    onready() {
        this.id = this.client.id;
        
        for (let plugin of this.registeredPlugins) {
            plugin._dispatchEvent("start", null);
        }

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

        console.log("<<", message);

        let precommandUsed = UTILS.startsWithAny(message, this.config["bot.precommand"]);
        const messageEvent = new DiscordMessageEvent(username, userId, channelId, message, precommandUsed, event);

        for (let plugin of this.registeredPlugins) {
            plugin._dispatchEvent("message", messageEvent);
        }

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

        for (let plugin of this.registeredPlugins) {
            plugin._dispatchEvent("command", commandEvent);
        }

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

    /**
     * Gets the channel with channelId
     * @param {String} channelId
     */
    getChannel(channelId) {
        return this.client.channels[channelId];
    }

    /**
     * Gets the server with serverId
     * @param {String} serverId id of server
     */
    getServer(serverId) {
        return this.client.servers[serverId];
    }

    /**
     * Gets user
     * @param {String} userId id of user
     */
    getUser(userId) {
        return this.client.users[userId];
    }

    /**
     * Gets user from channel
     * @param {String} userId id of user
     * @param {String} channelId id of server
     */
    getUser_channel(userId, channelId) {
        return this.getServer(this.getChannel(channelId).guild_id).members[userId];
    }

    /**
     * Gets user from server
     * @param {String} userId id of user
     * @param {String} serverId id of server
     */
    getUser_server(userId, serverId) {
        return this.getServer(serverId).members[userId];
    }

    /**
     * Gets the permissions of user from userId in channelId
     * @param {String} userId id of user
     */
    getPermissions_channel(channelId, userId) {
        const serverId = this.getChannel(channelId).guild_id;
        return this.getPermissions_server(serverId, userId);
    }

    /**
     * Gets the permissions of user from userId in serverId
     * @param {String} userId id of user
     */
    getPermissions_server(serverId, userId) {
        const server = this.getServer(serverId);

        const user = server.members[userId];
        const roles = user.roles.concat([serverId]);

        let permissionsNum = 0;

        for (let role of roles) {
            permissionsNum |= server.roles[role].permissions;
        }

        return new Permissions(permissionsNum);
    }
}

module.exports = Bot;