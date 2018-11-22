/**
 * @typedef {import("discord.js").Client} Client
 * @typedef {import("discord.js").Channel} Channel
 * @typedef {import("discord.js").TextChannel} TextChannel
 * @typedef {import("discord.js").Message} Message
 * @typedef {import("./botcommandOptions.js")} BotCommandOptions
 * @typedef {import("./plugin.js")} Plugin
 * @typedef {import("./botcommandHelp.js")} BotCommandHelp
 */

const UTILS = require("./utils.js");
const FS = require("fs");
const Permissions = require("./permissions.js");
const Logger = require("../src/logger.js");

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
         * @public
         */
        this.id = undefined;

        /**
         * Discord.io Client
         * @type {Client}
         * @private
         */
        this.client = client;

        /**
         * Function to call to restart itself
         * @type {Function} 
         * @private
         */
        this.restartFunc = restartFunc;

        /** 
         * config.json data
         * @type {Object}
         * @private
         */
        this.config = config;

        /**
         * Precommands that trigger the bot
         * @type {String[]}
         * @private
         */
        this.precommand = this.config["bot.precommand"] || ["!"];

        /**
         * The theme color used for general embeds
         * @type {Number}
         */
        this.themeColor = parseInt(this.config["bot.themeColor"], 16);

        /**
         * Bot logging level
         * @type {Number}
         * @private
         */
        this.loggingLevel = this.config["bot.logging"] || 3;
        Logger.setLevel(this.loggingLevel);

        /**
         * Tell the user that th bot doesn't know command?
         * @type {Boolean}
         */
        this.doAlertCommandDoesNotExist = this.config["bot.alertCommandDoesNotExist"];

        /** 
         * Path to memory
         * @type {String} 
         * @private
         */
        this.memoryPath = memoryPath;
        /**
         * Bot memory
         * @type {Object}
         * @private
         */
        this.memory = memory;

        /**
         * Timeout that writes memory to disk every once in a while
         * @type {NodeJS.Timeout}
         * @private
         */
        this.autoWriteSI = null;
        /** 
         * How often to auto-write to disk?
         * @type {Number}
         * @private
         */
        this.autoWriteInterval = this.config["memory.autoWriteInterval"] || 60 * 1000; // every minute
        /**
         * Has the memory changed since last write?
         * @type {Boolean}
         * @private
         */
        this.memoryChanged = false;

        /**
         * @type {BotCommand[]} list of commands registered
         * @private
         */
        this.registeredCommands = [];

        /**
         * @type {Plugin[]} list of plugins registered
         * @private
         */
        this.registeredPlugins = [];

        /** 
         * All events and handlers
         * @type {Object.<string, Function[]>}
         * @private
         */
        this.events = {
            "message": [],
            "command": [],
            "send": [],
            "senddm": [],
            "sent": [],
            "start": [],
            "beforememorywrite": [],
            "aftermemorywrite": [],
            "addasync": [],
            "doneasync": []
        };

        /** 
         * Memory namespace for permission 
         * @type {String}
         * @public
         */
        this.permissionsNamespace = "permissions";
        /**
         * Memory Permission admin user
         * @type {String}
         * @public
         */
        this.permissionsAdmin = "_admin";
        /** 
         * Memory global identifier
         * @type {String}
         * @public
         */
        this.permissionsGlobal = "global";
        /**
         * Memory name delimiter
         * @type {String}
         * @public
         */
        this.memoryDelimiter = ".";


        /**
         * How many active asnyc requests are running
         * @type {Number}
         * @private
         */
        this.activeAsnycRequests = 0;

        /**
         * Maps userId to DM Channel Id
         * @type {Object.<string, string>}
         */
        this.userIdDMMap = {};

        /**
         * Data for help
         * @type {Object.<string, BotCommandHelp>}
         */
        this.helpData = {};

        this.start();
    }

    /**
     * Adds event listener
     * @param {String} name name of event
     * @param {Function} func handler/callback function
     * @public
     */
    addEventListener(name, func) {
        this.events[name].push(func);
    }

    /**
     * Call all event handlers for event
     * @param {String} name of event
     * @param {*} event Event data sent with dispatch
     * @private
     */
    dispatchEvent(name, event) {
        for (let handler of this.events[name]) {
            handler(this, event);
        }
    }

    /**
     * Add new asnyc request to wait for
     */
    newAsyncRequest() {
        this.activeAsnycRequests++;
        this.dispatchEvent("addasync", this.activeAsnycRequests);
    }

    /**
     * Remove asnyc request to wait for
     */
    doneAsyncRequest() {
        this.activeAsnycRequests--;
        this.dispatchEvent("doneasync", this.activeAsnycRequests);
    }

    /**
     * Checks if there're more active asnyc requests
     * @returns {Boolean}
     */
    hasActiveAsyncRequests() {
        return this.activeAsnycRequests > 0;
    }

    /**
     * Starts the bot
     */
    start() {
        Logger.log("Bot starting...");

        this.registerCommand("restart", this.restart, new BotCommandOptions({
            requiredPermission: "BOT_ADMINISTRATOR"
        }));

        this.autoWriteSI = setInterval(this.writeMemory.bind(this, true), this.autoWriteInterval);

        if (this.client.readyAt) {
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
        Logger.log("Restarting");
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
        let command = new BotCommand(this, triggerWord, func, options);

        this.registeredCommands.push(command);
        this.registerHelp(command.commandName, command.help || null);
    }

    /**
     * Add help information
     * @param {String} command name of command for help
     * @param {BotCommandHelp} data command help data
     */
    registerHelp(command, data) {
        this.helpData[command] = data;
    }

    /**
     * Get help information
     * @param {String} command name of command for help
     * @returns {BotCommandHelp} help infomation about command
     */
    getHelp(command) {
        return this.helpData[command];
    }

    /**
     * Send message
     * @param {String} channelId channel id
     * @param {String | Object} message message to send
     * @returns {Promise} resolves when sent
     */
    send(channelId, message) {
        Logger.log_message(">>", message);

        let promise;
        /** @type {TextChannel} */
        // @ts-ignore
        let textChannel = this.getChannel(channelId);

        if (textChannel.type !== "text") throw new TypeError("Channel is not an instanceof TextChannel");

        this.dispatchEvent("send", message);

        if (typeof message === "string") {
            promise = textChannel.send(message);
        } else if (typeof message === "object") {
            promise = textChannel.send(message);
        } else {
            throw new TypeError("Message is not of valid type");
        }

        return promise;
    }

    sendDM(userId, message, failCallback) {
        Logger.log_message("D>", message);

        let DMs = this.client.directMessages[this.userIdDMMap[userId]];
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
                function (err, DMs) {
                    if (err) {
                        Logger.warn("Failed to get DMs");
                        if (failCallback) {
                            failCallback();
                        }
                        return;
                    }
                    messageObject.to = DMs.id;
                    this.userIdDMMap[userId] = DMs.id;
                    this.client.sendMessage(messageObject);
                }.bind(this));
        }

        this.dispatchEvent("senddm", this);
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
        this.newAsyncRequest();

        this.dispatchEvent("beforememorywrite", null);

        FS.writeFile(this.memoryPath, JSON.stringify(this.memory), 
            /** @this {Bot} */
            function (e) {
                this.doneAsyncRequest();

                if (e) {
                    Logger.error("Failed to write to memory", e);
                    return;
                }
                Logger.log("Written to memory");
            }.bind(this));

        this.memoryChanged = false;
    }

    /**
     * ready callback
     */
    onready() {
        this.id = this.client.user.id;

        this.dispatchEvent("start", null);

        Logger.log("Started");
    }

    /**
     * onmessage callback
     * @param {Message} message of sender
     */
    onmessage(message) {
        let precommandUsed = UTILS.startsWithAny(message.content, this.precommand);
        let isDM = this.getChannel(message.channel.id) ? false : true;

        const messageEvent = 
            new DiscordMessageEvent(
                message.author.username, message.author.id, message.channel.id, 
                message.guild.id, message.content, precommandUsed, message, isDM
            );

        if (message.author.id === this.id) {
            this.dispatchEvent("sent", messageEvent);
            return;
        }

        Logger.log_message("<<", message);

        this.dispatchEvent("message", messageEvent);

        if (precommandUsed) {
            this.oncommand(messageEvent, precommandUsed, message.content.slice(precommandUsed.length));
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

        this.dispatchEvent("command", commandEvent);

        let someCommandRan = false;

        for (let i = this.registeredCommands.length - 1; i >= 0; i--) {
            let command = this.registeredCommands[i];
            let ran = command.testAndRun(commandEvent);
            if (ran) {
                someCommandRan = true;
                break;
            }
        }

        if (!someCommandRan) {
            // command doesn't exist
            if (this.doAlertCommandDoesNotExist) {
                this.send(messageEvent.channelId, "<@" + messageEvent.userId + ">, that command doesn't exist");
            }
        }
    }

    /**
     * Gets the channel with channelId
     * @param {String} channelId
     */
    getChannel(channelId) {
        return this.client.channels.get(channelId);
    }

    /**
     * Gets server from channelId
     * @param {String} channelId id of channel
     */
    getServerFromChannel(channelId) {
        let channel = this.getChannel(channelId);
        if (!channel) return null;
        return ;
    }

    /**
     * Gets the server with serverId
     * @param {String} serverId id of server
     */
    getServer(serverId) {
        return this.client.guilds.get(serverId);
    }

    /**
     * Gets user
     * @param {String} userId id of user
     */
    getUser(userId) {
        return this.client.users.get(userId);
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
     * Gets a role in a server
     * @param {String} roleId id of role
     * @param {String} serverId id of server
     */
    getRole(roleId, serverId) {
        let server = this.getServer(serverId);
        return server.roles.get(roleId);
    }

    /**
     * Gets user from server
     * @param {String} userId id of user
     * @param {String} serverId id of server
     */
    getUser_server(userId, serverId) {
        return this.getServer(serverId).members.get(userId);
    }

    /**
     * Gets the global permissions of user
     * @param {String} userId id of user
     */
    getPermissions_global(userId) {
        let permissions = new Permissions();
        permissions.importCustomPermissions(
            this.recall(this.permissionsNamespace, this.createLocationKey_user_global(userId))
        );
        return permissions;
    }

    /**
     * Gets the permissions of user from userId in serverId
     * @param {String} userId id of user
     * @param {String} [serverId] id of server
     * @param {String} [channelId] if of channel
     */
    getPermissions_channel(userId, serverId, channelId) {
        let server, user, roles;
        let permissionsNum = 0;

        if (serverId) {
            server = this.getServer(serverId);
            user = server.members.get(userId);
            roles = user.roles.array();

            for (let role of roles) {
                // @ts-ignore
                permissionsNum |= role.permissions;
            }
        }

        let permissions = new Permissions(permissionsNum);
        permissions.importCustomPermissions(
            this.recall(this.permissionsNamespace, this.createLocationKey_user_global(userId))
        );

        if (serverId) {
            permissions.importCustomPermissions(
                this.recall(this.permissionsNamespace, this.createLocationKey_user_server(serverId, userId))
            );
        }

        if (channelId) {
            permissions.importCustomPermissions(
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

        let customPerms = this.recall(this.permissionsNamespace,
            this.createLocationKey_user_channel(serverId, userId, channelId)
        );

        let permissions = new Permissions();
        permissions.importCustomPermissions(customPerms);
        permissions.customWrite(permissionName, value);

        this.remember(this.permissionsNamespace,
            this.createLocationKey_user_channel(serverId, userId, channelId),
            permissions.getCustomPermissions(), true
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
        let customPerms = this.recall(this.permissionsNamespace,
            this.createLocationKey_user_server(serverId, userId)
        );

        let permissions = new Permissions();
        permissions.importCustomPermissions(customPerms);
        permissions.customWrite(permissionName, value);

        this.remember(this.permissionsNamespace,
            this.createLocationKey_user_server(serverId, userId),
            permissions.getCustomPermissions(), true
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
        permission.importCustomPermissions(permString);
        permission.customWrite(permissionName, value);

        this.remember(this.permissionsNamespace,
            this.createLocationKey_user_global(userId),
            permission.getCustomPermissions(), true
        );
    }

    /**
     * Sets rich presence game
     * @param {String} name of game
     */
    playGame(name) {
        this.client.user.setPresence({
            game: {
                name: name || null,
                type: 0
            },
            idle_since: Date.now() - 1
        });
    }
}

module.exports = Bot;