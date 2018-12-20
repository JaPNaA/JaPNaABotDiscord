/**
 * @typedef {import("discord.js").Client} Client
 * @typedef {import("discord.js").TextChannel} TextChannel
 * @typedef {import("discord.js").User} User
 *
 * @typedef {import("./botHooks.js")} BotHooks
 */
declare const Logger: any;
declare class PresenceSetter {
    /**
     * @param {Client} client
     */
    constructor(client: any);
    /**
     * Sets rich presence game to play
     * @param {String} name of game
     */
    setGame(name: any): void;
    /**
     * Sets rich presence game to watch
     * @param {String} name of game
     */
    setWatch(name: any): void;
    /**
     * Sets rich presence music to listen
     * @param {String} name of game
     */
    setListen(name: any): void;
    /**
     * Sets rich presence game to stream
     * @param {String} name of game
     */
    setStream(name: any): void;
}
declare class SentMessageRecorder {
    constructor();
    /**
     * Records the sent message, if is recording in channel
     * @param {String} channelId id of channel
     * @param {String | Object} message message that was sent
     */
    recordSentMessage(channelId: any, message: any): void;
    /**
     * Starts recording message sent to a channel
     * @param {String} channelId id of channel
     */
    startRecordingMessagesSentToChannel(channelId: any): void;
    /**
     * Stops recording messages sent to a channel,
     * and flushes (clear and returns) the sent messages
     * that were recorded
     * @param {String} channelId id of channel
     * @returns {object[]} recorded sent messages
     */
    stopAndFlushSentMessagesRecordedFromChannel(channelId: any): any;
}
declare class BotClient {
    /**
     * @param {BotHooks} botHooks
     * @param {Client} client
     */
    constructor(botHooks: any, client: any);
    init(): void;
    isReady(): any;
    /**
     * Check if an author is itself
     * @param {User} author author
     */
    isSelf(author: any): boolean;
    /**
     * Send message
     * @param {String} channelId channel id
     * @param {String | Object} message message to send
     * @returns {Promise} resolves when sent
     */
    send(channelId: any, message: any): any;
    /**
     * Converts a message (string | object) into an object
     * @param {String | Object} message Message
     */
    _createMessageObject(message: any): any;
    /**
     * Sends direct message
     * @param {String} userId id of user
     * @param {String | Object} message message to send
     * @param {Function} [failCallback] callback if failed
     * @returns {Promise} resolves when message sends, rejcts if fail
     */
    sendDM(userId: any, message: any, failCallback: any): any;
    /**
     * Gets the channel with channelId
     * @param {String} channelId
     */
    getChannel(channelId: any): any;
    /**
     * Gets server from channelId
     * @param {String} channelId id of channel
     */
    getServerFromChannel(channelId: any): null | undefined;
    /**
     * Gets the server with serverId
     * @param {String} serverId id of server
     */
    getServer(serverId: any): any;
    /**
     * Gets user
     * @param {String} userId id of user
     */
    getUser(userId: any): any;
    /**
     * Gets a role in a server
     * @param {String} roleId id of role
     * @param {String} serverId id of server
     */
    getRole(roleId: any, serverId: any): any;
    /**
     * Gets user from server
     * @param {String} userId id of user
     * @param {String} serverId id of server
     */
    getMemberFromServer(userId: any, serverId: any): any;
    getPing(): any;
}
