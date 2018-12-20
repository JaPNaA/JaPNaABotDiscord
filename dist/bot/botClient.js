"use strict";
/**
 * @typedef {import("discord.js").Client} Client
 * @typedef {import("discord.js").TextChannel} TextChannel
 * @typedef {import("discord.js").User} User
 *
 * @typedef {import("./botHooks.js")} BotHooks
 */
const Logger = require("../logger.js");
class PresenceSetter {
    /**
     * @param {Client} client
     */
    constructor(client) {
        /** @type {Client} */
        this.client = client;
    }
    /**
     * Sets rich presence game to play
     * @param {String} name of game
     */
    setGame(name) {
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
    setWatch(name) {
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
    setListen(name) {
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
    setStream(name) {
        this.client.user.setPresence({
            game: {
                name: name || null,
                type: "STREAMING"
            }
        });
    }
}
class SentMessageRecorder {
    constructor() {
        /**
         * The recorded sent messages
         * @type {Object.<string, object[]>}
         */
        this.recordedSentMessages = {};
    }
    /**
     * Records the sent message, if is recording in channel
     * @param {String} channelId id of channel
     * @param {String | Object} message message that was sent
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
}
class BotClient {
    /**
     * @param {BotHooks} botHooks
     * @param {Client} client
     */
    constructor(botHooks, client) {
        /** @type {BotHooks} */
        this.botHooks = botHooks;
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
         * Maps userId to DM Channel Id
         * @type {Object.<string, string>}
         */
        this.userIdDMMap = {};
        this.client.on("error", function (error) {
            Logger.error(error);
        });
        /** @type {PresenceSetter} */
        this.presence = new PresenceSetter(this.client);
        /** @type {SentMessageRecorder} */
        this.sentMessageRecorder = new SentMessageRecorder();
    }
    init() {
        this.id = this.client.user.id;
    }
    isReady() {
        return new Boolean(this.client.readyAt);
    }
    /**
     * Check if an author is itself
     * @param {User} author author
     */
    isSelf(author) {
        return author.id === this.id;
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
        this.botHooks.events.dispatch("send", message);
        if (typeof message === "string") {
            if (message.trim().length === 0)
                message = "_This message is empty_";
            promise = textChannel.send(message);
        }
        else if (typeof message === "object") {
            promise = textChannel.send(message);
        }
        else {
            throw new TypeError("Message is not of valid type");
        }
        this.sentMessageRecorder.recordSentMessage(channelId, message);
        return promise;
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
        }
        else if (typeof message === "object") {
            messageObject = Object.assign({}, message);
        }
        else {
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
        this.botHooks.events.dispatch("senddm", this);
        return promise;
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
        if (!channel)
            return null;
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
    getMemberFromServer(userId, serverId) {
        return this.getServer(serverId).members.get(userId);
    }
    getPing() {
        return this.client.ping;
    }
}
module.exports = BotClient;
