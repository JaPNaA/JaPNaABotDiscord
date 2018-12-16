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

const Logger = require("../logger.js");

const { DiscordCommandEvent, DiscordMessageEvent } = require("../events.js");
const BotCommand = require("../botcommand.js");
const BotCommandOptions = require("../botcommandOptions.js");
const Precommand = require("../precommand.js");

const BotConfig = require("./botConfig.js");
const BotMemory = require("./memory/botMemory.js");
const BotHooks = require("./botHooks.js");
const BotPermission = require("./botPermissions.js");
const BotEvents = require("./events/botEvents.js");

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
         */
        this.client = client;

        /**
         * Function to call to restart itself
         * @type {Function} 
         */
        this.restartFunc = restartFunc;

        /**
         * Hooks that can be sent to objects
         * @type {BotHooks}
         */
        this.hooks = new BotHooks(this);

        /** 
         * Bot config - handles configuration settings
         * @type {BotConfig}
         */
        this.config = new BotConfig(config);
        this.hooks.attachConfig(this.config);

        /**
         * Bot memory - handles remembering things
         * @type {BotMemory}
         */
        this.memory = new BotMemory(this.hooks, memoryPath, memory);
        this.hooks.attachMemory(this.memory);

        /**
         * Bot permission - handles getting and setting permissions
         * @type {BotPermission}
         */
        this.permission = new BotPermission(this.hooks);

        /**
         * Bot events - handles handling events
         * @type {BotEvents}
         */
        this.events = new BotEvents();
        this.hooks.attachEvents(this.events);

        /**
         * Precommands that trigger the bot, with callbacks
         * @type {Precommand[]}
         */
        this.registeredPrecommands = [];

        /**
         * @type {BotCommand[]} list of commands registered
         */
        this.registeredCommands = [];

        /**
         * @type {Map<string, BotCommand[]>} groups of commands
         */
        this.commandGroups = new Map();

        /**
         * @type {Plugin[]} list of plugins registered
         */
        this.registeredPlugins = [];

        /**
         * How many active asnyc requests are running
         * @type {Number}
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
     * Add new asnyc request to wait for
     */
    newAsyncRequest() {
        this.activeAsnycRequests++;
        this.events.dispatchEvent("addasync", this.activeAsnycRequests);
    }

    /**
     * Remove asnyc request to wait for
     */
    doneAsyncRequest() {
        this.activeAsnycRequests--;
        this.events.dispatchEvent("doneasync", this.activeAsnycRequests);
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

        this.events.dispatchEvent("stop", null);

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
            this.memory.createKey.plugin(command.pluginName)
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

        this.events.dispatchEvent("send", message);

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

        this.events.dispatchEvent("senddm", this);

        return promise;
    }

    /**
     * Gets the config for a plugin
     * @param {String} namespace namespace of config
     */
    getConfig_plugin(namespace) {
        return this.config.get(this.memory.createKey.plugin(namespace));
    }

    /**
     * ready callback
     */
    onready() {
        this.id = this.client.user.id;
        this.events.dispatchEvent("start", null);
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
            this.events.dispatchEvent("sent", messageEvent);
            return;
        }

        Logger.log_message("<<", message);

        this.events.dispatchEvent("message", messageEvent);

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

        this.events.dispatchEvent("command", commandEvent);

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