/**
 * @typedef {import("discord.io").Client} Client;
 * @typedef {import("./botcommandOptions.js")} BotCommandOptions
 */

const UTILS = require("./utils.js");
const FS = require("fs");
const Permissions = require("./permissions.js");

const { DiscordCommandEvent, DiscordMessageEvent } = require("./events.js");
const BotCommand = require("./botcommand.js");
const BotCommandOptions = require("./botcommandOptions.js");

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
        /**
         * userId of the bot
         * @type {String}
         */
        this.id = undefined;

        /**
         * Discord.io Client
         * @type {Client}
         */
        this.client = client;

        /**
         * Function to call to restart itself
         * @type {Function} 
         */
        this.restartFunc = restartFunc;

        /** 
         * config.json data
         * @type {Object}
         */
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

        this.permissionsNamespace = "permissions";
        this.permissionsAdmin = "_admin";
        this.permissionsGlobal = "global";
        this.memoryDelimiter = ".";

        this.start();
    }

    /**
     * Starts the bot
     */
    start() {
        console.log("Bot starting...");

        this.registerCommand("restart", this.restart, new BotCommandOptions({
            requiredPermission: "BOT_ADMINISTRATOR"
        }));

        this.autoWriteSI = setInterval(this.writeMemory.bind(this, true), this.autoWriteInterval);

        if (this.client.connected) {
            this.onready();
        }
    }

    /**
     * Stops the bot (async)
     */
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

    /**
     * Register a command
     * @param {String} triggerWord word that triggers command
     * @param {Function} func function to call
     * @param {BotCommandOptions} [options] permissions required to call function
     */
    registerCommand(triggerWord, func, options) {
        this.registeredCommands.push(new BotCommand(this, triggerWord, func, options));
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

    sendDM(userId, message, failCallback) {
        console.log("D>", message);

        let DMs = this.client.directMessages[userId];
        let messageObject = null;

        if (typeof message === "string") {
            messageObject = {
                message: message
            };
        } else if (typeof message === "object") {
            messageObject = {
                ...message
            };
        } else {
            throw new TypeError("Message is not of valid type");
        }
        

        if (DMs) {
            messageObject.to = DMs.id;
            this.client.sendMessage(messageObject);
        } else {
            this.client.createDMChannel(userId, 
                /**
                 * @this {Bot}
                 */
                function(err, DMs) {
                    if (err) {
                        console.error("Failed to get DMs");
                        if (failCallback) {
                            failCallback();
                        }
                        return;
                    }
                    messageObject.to = DMs.id;
                    this.client.sendMessage(messageObject);
                }.bind(this));
        }

        for (let plugin of this.registeredPlugins) {
            plugin._dispatchEvent("send", message);
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
     * Gets the config for a plugin
     * @param {String} namespace namespace of config
     */
    getConfig_plugin(namespace) {
        return this.config["plugin" + this.memoryDelimiter + namespace];
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

        for (let i = this.registeredCommands.length - 1; i >= 0; i--) {
            let command = this.registeredCommands[i];
            let ran = command.testAndRun(commandEvent);
            if (ran) break;
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
     * Gets server from channelId
     * @param {String} channelId id of channel
     */
    getServerFromChannel(channelId) {
        let channel = this.client.channels[channelId];
        if (!channel) return null;
        return this.getServer(channel.guild_id);
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
     * Creates the global key
     */
    createLocationKey_global() {
        return this.permissionsGlobal;
    }

    /**
     * Creates the key for server
     * @param {String} serverId id of server
     */
    createLocationKey_server(serverId) {
        return serverId;
    }

    /**
     * Create the key for channel
     * @param {String} serverId id of server
     * @param {String} channelId id of channel
     */
    createLocationKey_channel(serverId, channelId) {
        return serverId + this.memoryDelimiter + channelId;
    }

    /**
     * Creates the location key
     * @param {String} userId id of user
     */
    createLocationKey_user_global(userId) {
        return this.permissionsGlobal + this.memoryDelimiter + userId;
    }

    /**
     * Creates the location key
     * @param {String} serverId id of server
     * @param {String} userId id of user
     */
    createLocationKey_user_server(serverId, userId) {
        return serverId + this.memoryDelimiter + userId;
    }

    /**
     * Creates the location key
     * @param {String} serverId id of user
     * @param {String} userId id of user
     * @param {String} channelId id of channel
     */
    createLocationKey_user_channel(serverId, userId, channelId) {
        return serverId + this.memoryDelimiter + userId + this.memoryDelimiter + channelId;
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
     * Gets the global permissions of user
     * @param {String} userId id of user
     */
    getPermissions_global(userId) {
        let permissions = new Permissions();
        permissions.customImportJSON(
            this.recall(this.permissionsNamespace, this.createLocationKey_user_global(userId))
        );
        return permissions;
    }

    /**
     * Gets the permissions of user from userId in channelId
     * @param {String} userId id of user
     * @param {String} channelId id of channel
     */
    getPermissions_channel(userId, channelId) {
        const channel = this.getChannel(channelId);
        let serverId;
        if (channel) {
            serverId = channel.guild_id;
        } else {
            serverId = null;
        }

        return this.getPermissions_server(userId, serverId, channelId);
    }

    /**
     * Gets the permissions of user from userId in serverId
     * @param {String} userId id of user
     * @param {String} [serverId] id of server
     * @param {String} [channelId] if of channel
     */
    getPermissions_server(userId, serverId, channelId) {
        let server, user, roles;
        let permissionsNum = 0;

        if (serverId) {
            server = this.getServer(serverId);
            user = server.members[userId];
            roles = user.roles.concat([serverId]);

            for (let role of roles) {
                // @ts-ignore
                permissionsNum |= server.roles[role]._permissions;
            }
        }

        let permissions = new Permissions(permissionsNum);
        permissions.customImportJSON(
            this.recall(this.permissionsNamespace, this.createLocationKey_user_global(userId))
        );

        if (serverId) {
            permissions.customImportJSON(
                this.recall(this.permissionsNamespace, this.createLocationKey_user_server(serverId, userId))
            );
        }

        if (channelId) {
            permissions.customImportJSON(
                this.recall(this.permissionsNamespace, 
                    this.createLocationKey_user_channel(serverId, userId, channelId)
                )
            );
        }

        return permissions;
    }

    /**
     * Sets the permissions of user in a channel
     * @param {String} userId user
     * @param {String} channelId id of channel
     * @param {String} permissionName name of permission
     * @param {Boolean} value value of permission to write
     */
    editPermissions_user_channel(userId, channelId, permissionName, value) {
        let serverId = this.getChannel(channelId).guild_id;
        
        let permString = this.recall(this.permissionsNamespace, 
            this.createLocationKey_user_channel(serverId, userId, channelId)
        );

        let permissions = new Permissions();
        permissions.customImportJSON(permString);
        permissions.customWrite(permissionName, value);

        this.remember(this.permissionsNamespace, 
            this.createLocationKey_user_channel(serverId, userId, channelId), 
            permissions.customToJSON(), true
        );
    }

    /**
     * Sets the permissions of user in a server
     * @param {String} userId id of user
     * @param {String} serverId id of server
     * @param {String} permissionName name of permission
     * @param {Boolean} value value of permission to write
     */
    editPermissions_user_server(userId, serverId, permissionName, value) {
        let permString = this.recall(this.permissionsNamespace,
            this.createLocationKey_user_server(serverId, userId)
        );

        let permissions = new Permissions();
        permissions.customImportJSON(permString);
        permissions.customWrite(permissionName, value);

        this.remember(this.permissionsNamespace,
            this.createLocationKey_user_server(serverId, userId),
            permissions.customToJSON(), true
        );
    }

    /**
     * Sets the permissions of user everywhere
     * @param {String} userId id of user
     * @param {String} permissionName name of permission
     * @param {Boolean} value of permission to write
     */
    editPermissions_user_global(userId, permissionName, value) {
        let permString = this.recall(this.permissionsNamespace, 
            this.createLocationKey_user_global(userId)
        );

        let permission = new Permissions();
        permission.customImportJSON(permString);
        permission.customWrite(permissionName, value);

        this.remember(this.permissionsNamespace,
            this.createLocationKey_user_global(userId),
            permission.customToJSON(), true
        );
    }

    /**
     * Sets rich presence game
     * @param {String} name of game
     */
    playGame(name) {
        this.client.setPresence({
            game: {
                name: name || null,
                type: 0
            },
            idle_since: Date.now() - 1
        });
    }
}

module.exports = Bot;