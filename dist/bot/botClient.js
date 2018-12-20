"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Logger = require("../logger.js");
class PresenceSetter {
    constructor(client) {
        this.client = client;
    }
    setGame(name) {
        this.client.user.setPresence({
            game: {
                name: name || undefined,
                type: "PLAYING"
            }
        });
    }
    setWatch(name) {
        this.client.user.setPresence({
            game: {
                name: name || undefined,
                type: "WATCHING"
            }
        });
    }
    setListen(name) {
        this.client.user.setPresence({
            game: {
                name: name || undefined,
                type: "LISTENING"
            }
        });
    }
    setStream(name) {
        this.client.user.setPresence({
            game: {
                name: name || undefined,
                type: "STREAMING"
            }
        });
    }
}
class SentMessageRecorder {
    constructor() {
        /** The recorded sent messages */
        this.recordedSentMessages = {};
    }
    /**
     * Records the sent message, if is recording in channel
     * @param channelId id of channel
     * @param message message that was sent
     */
    recordSentMessage(channelId, message) {
        let sentMessagesArr = this.recordedSentMessages[channelId];
        if (!sentMessagesArr)
            return;
        sentMessagesArr.push(message);
    }
    /**
     * Starts recording message sent to a channel
     * @param channelId id of channel
     */
    startRecordingMessagesSentToChannel(channelId) {
        this.recordedSentMessages[channelId] = [];
    }
    /**
     * Stops recording messages sent to a channel,
     * and flushes (clear and returns) the sent messages
     * that were recorded
     * @param channelId id of channel
     * @returns {any[]} recorded sent messages
     */
    stopAndFlushSentMessagesRecordedFromChannel(channelId) {
        let sentMessages = this.recordedSentMessages[channelId];
        this.recordedSentMessages[channelId] = null;
        return sentMessages || [];
    }
}
class BotClient {
    /**
     * @param {BotHooks} botHooks
     * @param {Client} client
     */
    constructor(botHooks, client) {
        this.botHooks = botHooks;
        /** Discord.io Client */
        this.client = client;
        /** Maps userId to DM Channel Id */
        this.userIdDMMap = {};
        this.presence = new PresenceSetter(this.client);
        this.sentMessageRecorder = new SentMessageRecorder();
        // Catch error, and logs them
        this.client.on("error", function (error) {
            Logger.error(error);
        });
    }
    init() {
        this.id = this.client.user.id;
    }
    isReady() {
        return new Boolean(this.client.readyAt);
    }
    isSelf(author) {
        return author.id === this.id;
    }
    /**
     * Send message
     * @returns A promise that resolves when sent
     */
    send(channelId, message) {
        Logger.log_message(">>", message);
        let promise;
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
     * @param message Message
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
     * @param userId id of user
     * @param message message to send
     * @param failCallback callback if failed
     * @returns A promise that resolves when message sends, rejcts if fail
     */
    sendDM(userId, message, failCallback) {
        Logger.log_message("D>", message);
        let user = this.getUser(userId);
        let messageObject = this._createMessageObject(message);
        let promise;
        if (user)
            promise = user.send(message, messageObject);
        if (failCallback)
            promise.catch(() => failCallback());
        this.botHooks.events.dispatch("senddm", this);
        return promise;
    }
    getChannel(channelId) {
        return this.client.channels.get(channelId);
    }
    getServerFromChannel(channelId) {
        let channel = this.getChannel(channelId);
        if (!channel)
            return null;
        return;
    }
    getServer(serverId) {
        return this.client.guilds.get(serverId);
    }
    getUser(userId) {
        return this.client.users.get(userId);
    }
    getRole(roleId, serverId) {
        let server = this.getServer(serverId);
        return server.roles.get(roleId);
    }
    getMemberFromServer(userId, serverId) {
        return this.getServer(serverId).members.get(userId);
    }
    getPing() {
        return this.client.ping;
    }
}
exports.default = BotClient;
