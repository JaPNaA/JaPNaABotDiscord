/**
 * @typedef {import("discord.js").Client} Client
 * @typedef {import("discord.js").Channel} Channel
 * @typedef {import("discord.js").TextChannel} TextChannel
 * @typedef {import("discord.js").Message} Message
 * @typedef {import("discord.js").User} User
 * @typedef {import("../botcommandOptions.js")} BotCommandOptions
 * @typedef {import("../plugin.js")} Plugin
 * @typedef {import("../botcommandHelp.js")} BotCommandHelp
 */

const Permissions = require("../permissions.js");
const Logger = require("../logger.js");

const { DiscordCommandEvent, DiscordMessageEvent } = require("../events.js");
const BotCommand = require("../botcommand.js");
const BotCommandOptions = require("../botcommandOptions.js");
const Precommand = require("../precommand.js");

const Config = require("./config.js");
const Memory = require("./memory.js");
const BotHooks = require("./botHooks.js");

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
         * Hooks that can be sent to objects
         * @type {BotHooks}
         */
        this.hooks = new BotHooks(this);

        /** 
         * config.json data
         * @type {Object}
         */
        this.config = new Config(config);
        this.hooks.attachConfig(this.config);

        /**
         * Bot memory
         * @type {Memory}
         */
        this.memory = new Memory(this.hooks, memoryPath, memory);
        this.hooks.attachMemory(memory);

        /**
         * Precommands that trigger the bot, with callbacks
         * @type {Precommand[]}
         */
        this.registeredPrecommands = [];

        /**
         * @type {BotCommand[]} list of commands registered
         * @private
         */
        this.registeredCommands = [];

        /**
         * @type {Map<string, BotCommand[]>} groups of commands
         */
        this.commandGroups = new Map();

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
            "stop": [],
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

        /**
         * The recorded sent messages
         * @type {Object.<string, object[]>}
         */
        this.recordedSentMessages = {};

        this.client.on("error", function (error) {
            Logger.error(error);
        });

        this.start();
    }

    /**
     * Registers a precommand with callback
     * @param {String} precommandStr precommand to register
     * @param {Function} callback callback on precommand
     */
    registerPrecommand(precommandStr, callback) {
        let precommand = new Precommand(precommandStr, callback);
        this.registeredPrecommands.push(precommand);
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
     * Check if an author is itself
     * @param {User} author author
     */
    isSelf(author) {
        return author.id === this.id;
    }

    /**
     * Starts the bot
     */
    start() {
        Logger.log("Bot starting...");

        this.registerCommandsAndPrecommands();
        Logger.setLevel(this.config.loggingLevel);
        this.memory.startAutoWrite();

        if (this.client.readyAt) {
            this.onready();
        }
    }

    registerCommandsAndPrecommands() {
        this.registerCommand("restart", "bot", this.restart, new BotCommandOptions({
            requiredPermission: "BOT_ADMINISTRATOR"
        }));

        for (let precommand of this.config.precommands) {
            this.registerPrecommand(precommand, this.onBotPrecommandCommand.bind(this));
        }
    }

    /**
     * Stops the bot (async)
     */
    stop() {
        for (let plugin of this.registeredPlugins) {
            plugin._stop();
        }

        this.dispatchEvent("stop", null);

        this.memory.writeOut_auto();

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
     * @param {String} pluginName name of plugin
     * @param {Function} func function to call
     * @param {BotCommandOptions} [options] permissions required to call function
     */
    registerCommand(triggerWord, pluginName, func, options) {
        let command = new BotCommand(this, triggerWord, pluginName, func, options);

        this.registeredCommands.push(command);
        this.applyConfigToCommand(command);
        this.addCommandToGroup(command.group, command);
        this.registerHelp(command.commandName, command.help || null);

        if (command.help) // if help is available
            command.help.gatherInfoAboutCommand(command);
    }

    /**
     * Apply config from bot.config to adjust command
     * @param {BotCommand} command command to apply config to
     */
    applyConfigToCommand(command) {
        let pluginOverrides = this.config.commandRequiredPermissionOverrides[
            this.createLocationKey_plugin(command.pluginName)
        ];
        let overridingRequiredPermission =
            pluginOverrides && pluginOverrides[command.commandName];

        if (overridingRequiredPermission) {
            command.requiredPermission = overridingRequiredPermission;
        }
    }

    /**
     * Adds a command to a group
     * @param {String | undefined} groupName name of group
     * @param {BotCommand} command command
     */
    addCommandToGroup(groupName, command) {
        let groupNameStr = groupName || "Other";

        if (this.commandGroups.has(groupNameStr)) {
            this.commandGroups.get(groupNameStr)
                .push(command);
        } else {
            this.commandGroups.set(groupNameStr, [command]);
        }
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

        if (textChannel.type == "voice")
            throw new TypeError("Cannot send to voice channel");

        this.dispatchEvent("send", message);

        if (typeof message === "string") {
            if (message.trim().length === 0)
                message = "_This message is empty_";
            promise = textChannel.send(message);
        } else if (typeof message === "object") {
            promise = textChannel.send(message);
        } else {
            throw new TypeError("Message is not of valid type");
        }

        this.recordSentMessage(channelId, message);

        return promise;
    }

    /**
     * Records a sent message
     * @param {String} channelId id of channel
     * @param {Object | String} message the message to be recorded
     */
    recordSentMessage(channelId, message) {
        if (!this.recordedSentMessages[channelId])
            return;

        this.recordedSentMessages[channelId].push(message);
    }

    /**
     * Starts recording message sent to a channel
     * @param {String} channelId id of channel
     */
    startRecordingMessagesSentToChannel(channelId) {
        this.recordedSentMessages[channelId] = [];
    }

    /**
     * Stops recording messages sent to a channel, 
     * and flushes (clear and returns) the sent messages
     * that were recorded
     * @param {String} channelId id of channel
     * @returns {object[]} recorded sent messages
     */
    stopAndFlushSentMessagesRecordedFromChannel(channelId) {
        let sentMessages = this.recordedSentMessages[channelId];
        this.recordedSentMessages[channelId] = null;
        return sentMessages;
    }

    /**
     * Converts a message (string | object) into an object
     * @param {String | Object} message Message
     */
    _createMessageObject(message) {
        let messageObject;

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

        return messageObject;
    }

    /**
     * Sends direct message
     * @param {String} userId id of user
     * @param {String | Object} message message to send
     * @param {Function} [failCallback] callback if failed
     * @returns {Promise} resolves when message sends, rejcts if fail
     */
    sendDM(userId, message, failCallback) {
        Logger.log_message("D>", message);

        let user = this.getUser(userId);
        let messageObject = this._createMessageObject(message);
        let promise;

        if (user)
            promise = user.send(message.message, messageObject);

        if (failCallback)
            promise.catch(() => failCallback());

        this.dispatchEvent("senddm", this);

        return promise;
    }

    /**
     * Gets the config for a plugin
     * @param {String} namespace namespace of config
     */
    getConfig_plugin(namespace) {
        return this.config.get(this.createLocationKey_plugin(namespace));
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
    onMessage(message) {
        let precommandUsedInMessage = this.getFirstPrecommand(message.content);

        /** @type {TextChannel} */
        // @ts-ignore
        let channel = message.channel;
        let isDM = channel.guild ? false : true;

        const messageEvent =
            new DiscordMessageEvent(
                message.author && message.author.username,
                message.author && message.author.id,
                message.channel && message.channel.id,
                message.guild && message.guild.id,
                message.content, precommandUsedInMessage, message, isDM
            );

        if (this.isSelf(message.author)) {
            this.dispatchEvent("sent", messageEvent);
            return;
        }

        Logger.log_message("<<", message);

        this.dispatchEvent("message", messageEvent);

        if (precommandUsedInMessage) {
            this.onBotPrecommandCommand(
                messageEvent, precommandUsedInMessage,
                message.content.slice(precommandUsedInMessage.precommandStr.length)
            );
        }
    }

    /**
     * checks if message starts with a precommand
     * @param {String} message
     * @returns {Precommand}
     */
    getFirstPrecommand(message) {
        for (let precommand of this.registeredPrecommands) {
            let startsWithPrecommand = message.startsWith(precommand.precommandStr);

            if (startsWithPrecommand) {
                return precommand;
            }
        }

        return null;
    }

    /**
     * called on command by onmessage
     * @param {DiscordMessageEvent} messageEvent message information
     * @param {Precommand} pre what bot.precommand was used
     * @param {String} commandStr message, without precommand
     */
    onBotPrecommandCommand(messageEvent, pre, commandStr) {
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
            if (this.config.doAlertCommandDoesNotExist) {
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
        return;
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
     * Creates the location key
     * @param {String} roleId id of user
     */
    createLocationKey_role_global(roleId) {
        return this.permissionsGlobal + this.memoryDelimiter + roleId;
    }

    /**
     * Creates the location key
     * @param {String} serverId id of server
     * @param {String} roleId id of user
     */
    createLocationKey_role_server(serverId, roleId) {
        return serverId + this.memoryDelimiter + roleId;
    }

    /**
     * Creates the location key
     * @param {String} serverId id of user
     * @param {String} roleId id of user
     * @param {String} channelId id of channel
     */
    createLocationKey_role_channel(serverId, roleId, channelId) {
        return serverId + this.memoryDelimiter + roleId + this.memoryDelimiter + channelId;
    }

    /**
     * Creates the location key
     * @param {String} pluginName name of plugin
     */
    createLocationKey_plugin(pluginName) {
        return "plugin" + this.memoryDelimiter + pluginName;
    }

    /**
     * Creates the location key
     * @param {String} groupName name of group of plugins
     */
    createLocationKey_pluginGroup(groupName) {
        return groupName;
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
     * Gets the permissions of role
     * @param {String} roleId id of role
     * @param {String} serverId id of server
     * @param {String} [channelId] id of channel
     * @returns {Permissions} permissions of role
     */
    getPermissions_role_channel(roleId, serverId, channelId) {
        let role = this.getRole(roleId, serverId);

        let permissions = new Permissions(role.permissions);
        if (channelId) {
            permissions.importCustomPermissions(
                this.memory.get(this.permissionsNamespace,
                    this.createLocationKey_role_channel(serverId, roleId, channelId)
                ));
        }

        permissions.importCustomPermissions(
            this.memory.get(this.permissionsNamespace,
                this.createLocationKey_role_server(serverId, roleId)
            ));

        return permissions;
    }

    /**
     * Gets the global permissions of user
     * @param {String} userId id of user
     */
    getPermissions_global(userId) {
        let permissions = new Permissions();
        permissions.importCustomPermissions(
            this.memory.get(this.permissionsNamespace, this.createLocationKey_user_global(userId))
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

            let permissions = user.permissions.bitfield;

            permissionsNum |= permissions;
        }

        let permissions = new Permissions(permissionsNum);
        permissions.importCustomPermissions(
            this.memory.get(this.permissionsNamespace, this.createLocationKey_user_global(userId))
        );

        if (roles) {
            for (let role of roles) {
                permissions.importCustomPermissions(
                    this.getPermissions_role_channel(role.id, serverId, channelId).getCustomPermissions()
                );
            }
        }

        if (serverId) {
            permissions.importCustomPermissions(
                this.memory.get(this.permissionsNamespace, this.createLocationKey_user_server(serverId, userId))
            );
        }

        if (channelId) {
            permissions.importCustomPermissions(
                this.memory.get(this.permissionsNamespace,
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
        /** @type { TextChannel } */
        // @ts-ignore
        let channel = this.getChannel(channelId);
        let serverId = channel.guild.id;

        let customPerms = this.memory.get(this.permissionsNamespace,
            this.createLocationKey_user_channel(serverId, userId, channelId)
        );

        let permissions = new Permissions();
        permissions.importCustomPermissions(customPerms);
        permissions.customWrite(permissionName, value);

        customPerms = permissions.getCustomPermissions();
        let locationKey = this.createLocationKey_user_channel(serverId, userId, channelId);
        if (customPerms.length) {
            this.memory.write(this.permissionsNamespace,
                locationKey, customPerms, true
            );
        } else {
            this.memory.write(this.permissionsNamespace,
                locationKey, undefined, true
            );
        }
    }

    /**
     * Sets the permissions of user in a server
     * @param {String} userId id of user
     * @param {String} serverId id of server
     * @param {String} permissionName name of permission
     * @param {Boolean} value value of permission to write
     */
    editPermissions_user_server(userId, serverId, permissionName, value) {
        let customPerms = this.memory.get(this.permissionsNamespace,
            this.createLocationKey_user_server(serverId, userId)
        );

        let permissions = new Permissions();
        permissions.importCustomPermissions(customPerms);
        permissions.customWrite(permissionName, value);

        customPerms = permissions.getCustomPermissions();
        let locationKey = this.createLocationKey_user_server(serverId, userId);
        if (customPerms.length) {
            this.memory.write(this.permissionsNamespace,
                locationKey, customPerms, true
            );
        } else {
            this.memory.write(this.permissionsNamespace,
                locationKey, undefined, true
            );
        }
    }

    /**
     * Sets the permissions of user in a channel
     * @param {String} roleId user
     * @param {String} channelId id of channel
     * @param {String} permissionName name of permission
     * @param {Boolean} value value of permission to write
     */
    editPermissions_role_channel(roleId, channelId, permissionName, value) {
        /** @type { TextChannel } */
        // @ts-ignore
        let channel = this.getChannel(channelId);
        let serverId = channel.guild.id;

        let customPerms = this.memory.get(this.permissionsNamespace,
            this.createLocationKey_role_channel(serverId, roleId, channelId)
        );

        let permissions = new Permissions();
        permissions.importCustomPermissions(customPerms);
        permissions.customWrite(permissionName, value);

        customPerms = permissions.getCustomPermissions();
        let locationKey = this.createLocationKey_role_channel(serverId, roleId, channelId);
        if (customPerms.length) {
            this.memory.write(this.permissionsNamespace,
                locationKey, customPerms, true
            );
        } else {
            this.memory.write(this.permissionsNamespace,
                locationKey, undefined, true
            );
        }
    }

    /**
     * Sets the permissions of user in a server
     * @param {String} roleId id of user
     * @param {String} serverId id of server
     * @param {String} permissionName name of permission
     * @param {Boolean} value value of permission to write
     */
    editPermissions_role_server(roleId, serverId, permissionName, value) {
        let customPerms = this.memory.get(this.permissionsNamespace,
            this.createLocationKey_role_server(serverId, roleId)
        );

        let permissions = new Permissions();
        permissions.importCustomPermissions(customPerms);
        permissions.customWrite(permissionName, value);

        customPerms = permissions.getCustomPermissions();
        let locationKey = this.createLocationKey_role_server(serverId, roleId);
        if (customPerms.length) {
            this.memory.write(this.permissionsNamespace,
                locationKey, customPerms, true
            );
        } else {
            this.memory.write(this.permissionsNamespace,
                locationKey, undefined, true
            );
        }
    }

    /**
     * Sets the permissions of user everywhere
     * @param {String} userId id of user
     * @param {String} permissionName name of permission
     * @param {Boolean} value of permission to write
     */
    editPermissions_user_global(userId, permissionName, value) {
        let customPerms = this.memory.get(this.permissionsNamespace,
            this.createLocationKey_user_global(userId)
        );

        let permissions = new Permissions();
        permissions.importCustomPermissions(customPerms);
        permissions.customWrite(permissionName, value);

        customPerms = permissions.getCustomPermissions();
        let locationKey = this.createLocationKey_user_global(userId);
        if (customPerms.length) {
            this.memory.write(this.permissionsNamespace,
                locationKey, customPerms, true
            );
        } else {
            this.memory.write(this.permissionsNamespace,
                locationKey, undefined, true
            );
        }
    }

    /**
     * Sets rich presence game to play
     * @param {String} name of game
     */
    presenceSetGame(name) {
        this.client.user.setPresence({
            game: {
                name: name || null,
                type: "PLAYING"
            }
        });
    }

    /**
     * Sets rich presence game to watch
     * @param {String} name of game
     */
    presenceSetWatch(name) {
        this.client.user.setPresence({
            game: {
                name: name || null,
                type: "WATCHING"
            }
        });
    }

    /**
     * Sets rich presence music to listen
     * @param {String} name of game
     */
    presenceSetListen(name) {
        this.client.user.setPresence({
            game: {
                name: name || null,
                type: "LISTENING"
            }
        });
    }

    /**
     * Sets rich presence game to stream
     * @param {String} name of game
     */
    presenceSetStream(name) {
        this.client.user.setPresence({
            game: {
                name: name || null,
                type: "STREAMING"
            }
        });
    }
}

module.exports = Bot;