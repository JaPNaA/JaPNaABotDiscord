"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const logger_js_1 = __importDefault(require("../../utils/logger.js"));
class PresenceSetter {
    client;
    constructor(client) {
        this.client = client;
    }
    setGame(name) {
        if (!name) {
            this.client.user?.setPresence({ activities: [] });
        }
        this.client.user?.setPresence({
            activities: [{ name: name, type: discord_js_1.ActivityType.Playing }]
        });
    }
    setWatch(name) {
        if (!name) {
            this.client.user?.setPresence({ activities: [] });
        }
        this.client.user?.setPresence({
            activities: [{
                    name: name,
                    type: discord_js_1.ActivityType.Watching
                }]
        });
    }
    setListen(name) {
        if (!name) {
            this.client.user?.setPresence({ activities: [] });
        }
        this.client.user?.setPresence({
            activities: [{
                    name: name,
                    type: discord_js_1.ActivityType.Listening
                }]
        });
    }
    setStream(name) {
        if (!name) {
            this.client.user?.setPresence({ activities: [] });
        }
        this.client.user?.setPresence({
            activities: [{
                    name: name,
                    type: discord_js_1.ActivityType.Streaming
                }]
        });
    }
    setCompete(name) {
        if (!name) {
            this.client.user?.setPresence({ activities: [] });
        }
        this.client.user?.setPresence({
            activities: [{
                    name: name,
                    type: discord_js_1.ActivityType.Competing
                }]
        });
    }
}
class SentMessageRecorder {
    recordedSentMessages;
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
        if (!sentMessagesArr) {
            return;
        }
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
     * @returns recorded sent messages
     */
    stopAndFlushSentMessagesRecordedFromChannel(channelId) {
        let sentMessages = this.recordedSentMessages[channelId];
        this.recordedSentMessages[channelId] = null;
        return sentMessages || [];
    }
}
class BotClient {
    bot;
    id;
    client;
    userIdDMMap;
    presence;
    sentMessageRecorder;
    constructor(bot, client) {
        this.bot = bot;
        /** Discord.io Client */
        this.client = client;
        /** Maps userId to DM Channel Id */
        this.userIdDMMap = {};
        this.presence = new PresenceSetter(this.client);
        this.sentMessageRecorder = new SentMessageRecorder();
        // catch error, and logs them
        this.client.on("error", function (error) {
            logger_js_1.default.error(error);
        });
        this.bot.events.ready._addSystemHandler(this.onReady.bind(this));
    }
    onReady() {
        this.id = this.client.user.id;
    }
    init() {
        this.id = this.client.user.id;
    }
    isReady() {
        return Boolean(this.client.readyAt);
    }
    isSelf(authorId) {
        return authorId === this.id;
    }
    // TODO: refactor send, sendDM
    /**
     * Send message
     * @returns A promise that resolves when sent
     */
    async send(channelId, message) {
        logger_js_1.default.log_message(">>", message);
        let promise;
        let textChannel = await this.getChannel(channelId);
        if (!textChannel) {
            throw new Error("Cannot find channel");
        }
        if (!textChannel.isTextBased() || !('send' in textChannel)) {
            throw new TypeError("Cannot send to non-text channel");
        }
        const { preventedSystem } = await this.bot.events.send.dispatch({
            channelId: channelId,
            content: message
        });
        if (preventedSystem) {
            throw new Error("Cannot send message -- blocked");
        }
        if (typeof message === "string") {
            if (message.trim().length === 0) {
                message = "_This message is empty_";
            }
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
    async sendEmbed(channelId, embed) {
        return this.send(channelId, {
            embeds: [embed]
        });
    }
    /**
     * Sends direct message
     * @param userId id of user
     * @param message message to send
     * @param failCallback callback if failed
     * @returns A promise that resolves when message sends, rejcts if fail
     */
    async sendDM(userId, message, failCallback) {
        logger_js_1.default.log_message("D>", message);
        let user = await this.getUser(userId);
        let promise;
        if (!user) {
            throw new Error("User not found");
        }
        const { preventedSystem } = await this.bot.events.sendDM.dispatch({
            userId: userId,
            content: message
        });
        if (preventedSystem) {
            throw new Error("Cannot send message -- blocked");
        }
        if (typeof message === "object" && message.hasOwnProperty("message")) {
            promise = user.send(message);
        }
        else {
            if (typeof message === "string" && message.trim().length === 0) {
                message = "_This message is empty_";
            }
            promise = user.send(message);
        }
        if (failCallback) {
            promise.catch(() => failCallback());
        }
        return promise;
    }
    async getChannel(channelId) {
        try {
            return await this.client.channels.fetch(channelId);
        }
        catch (err) {
            if (err instanceof discord_js_1.DiscordAPIError) {
                return null;
            }
            else {
                throw err;
            }
        }
    }
    async getServerFromChannel(channelId) {
        let channel = await this.getChannel(channelId);
        if (!channel) {
            return;
        }
        // @ts-ignore
        return channel.guild;
    }
    getServer(serverId) {
        return this.client.guilds.fetch(serverId);
    }
    async getUser(userId) {
        try {
            return await this.client.users.fetch(userId);
        }
        catch (err) {
            if (err instanceof discord_js_1.DiscordAPIError) {
                return undefined;
            }
            else {
                throw err;
            }
        }
    }
    async getMessageFromChannel(channelId, messageId) {
        const channel = await this.getChannel(channelId);
        if (channel?.isTextBased() && 'messages' in channel) {
            return channel.messages.fetch(messageId);
        }
        else {
            throw new Error("Channel doesn't exist or is not text");
        }
    }
    async getRole(roleId, serverId) {
        let server = await this.getServer(serverId);
        if (!server) {
            return null;
        }
        return server.roles.fetch(roleId);
    }
    async getMemberFromServer(userId, serverId) {
        let server = await this.getServer(serverId);
        if (!server) {
            return;
        }
        return server.members.fetch(userId);
    }
    getPing() {
        return this.client.ws.ping;
    }
}
exports.default = BotClient;
