/**
 * @typedef {import("discord.js").Client} Client
 * @typedef {import("discord.js").Channel} Channel
 * @typedef {import("discord.js").TextChannel} TextChannel
 * @typedef {import("discord.js").Message} Message
 * @typedef {import("discord.js").User} User
 * @typedef {import("../botcommandOptions.js")} BotCommandOptions
 * @typedef {import("../plugin.js")} Plugin
 * @typedef {import("../botcommandHelp.js")} BotCommandHelp
 * @typedef {import("../precommand.js")} Precommand
 */

const Logger = require("../logger.js");

const { DiscordCommandEvent, DiscordMessageEvent } = require("../events.js");
const BotCommandOptions = require("../botcommandOptions.js");

const BotConfig = require("./botConfig.js");
const BotMemory = require("./memory/botMemory.js");
const BotHooks = require("./botHooks.js");
const BotPermissions = require("./botPermissions.js");
const BotEvents = require("./botEvents.js");
const CommandManager = require("./commandManager/commandManager.js");

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
         * @type {BotPermissions}
         */
        this.permissions = new BotPermissions(this.hooks);
        this.hooks.attachPermissions(this.permissions);

        /**
         * Bot events - handles handling events
         * @type {BotEvents}
         */
        this.events = new BotEvents(this.hooks);
        this.hooks.attachEvents(this.events);

        /**
         * Bot command manager - manages registering commands and dispatching
         * @type {CommandManager}
         */
        this.commandManager = new CommandManager(this.hooks);
        this.hooks.attachCommandManager(this.commandManager);

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
     * Add new asnyc request to wait for
     */
    newAsyncRequest() {
        this.activeAsnycRequests++;
        this.events.dispatch("addasync", this.activeAsnycRequests);
    }

    /**
     * Remove asnyc request to wait for
     */
    doneAsyncRequest() {
        this.activeAsnycRequests--;
        this.events.dispatch("doneasync", this.activeAsnycRequests);
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
        this.commandManager.registerCommand("restart", "bot", this.restart, new BotCommandOptions({
            requiredPermission: "BOT_ADMINISTRATOR"
        }));

        for (let precommand of this.config.precommands) {
            this.commandManager.registerPrecommand(precommand, this.onBotPrecommandCommand.bind(this));
        }
    }

    /**
     * Stops the bot (async)
     */
    stop() {
        this.commandManager.unregisterAllPlugins();

        this.events.dispatch("stop", null);

        this.memory.writeOut_auto();
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

        this.events.dispatch("send", message);

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

        this.events.dispatch("senddm", this);

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
        this.events.dispatch("start", null);
        Logger.log("Started");
    }

    /**
     * onmessage callback
     * @param {Message} message of sender
     */
    onMessage(message) {
        let precommandUsedInMessage = this.commandManager.getFirstPrecommand(message.content);

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
            this.events.dispatch("sent", messageEvent);
            return;
        }

        Logger.log_message("<<", message);

        this.events.dispatch("message", messageEvent);

        if (precommandUsedInMessage) {
            this.onBotPrecommandCommand(
                messageEvent, precommandUsedInMessage,
                message.content.slice(precommandUsedInMessage.precommandStr.length)
            );
        }
    }

    /**
     * called on command by onmessage
     * @param {DiscordMessageEvent} messageEvent message information
     * @param {Precommand} pre what bot.precommand was used
     * @param {String} commandStr message, without precommand
     */
    onBotPrecommandCommand(messageEvent, pre, commandStr) {
        const commandEvent = new DiscordCommandEvent(messageEvent, pre, commandStr);

        this.events.dispatch("command", commandEvent);

        let someCommandRan = false;

        for (let i = this.commandManager.registeredCommands.length - 1; i >= 0; i--) {
            let command = this.commandManager.registeredCommands[i];
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