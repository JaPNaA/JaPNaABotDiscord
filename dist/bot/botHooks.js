"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BotHooks {
    /**
     * @param {Bot} bot
     */
    constructor(bot) {
        // Workaround and hacks below.
        this.memory = null;
        this.config = null;
        this.events = null;
        this.permissions = null;
        this.commandManager = null;
        this.client = null;
        this.rawEventAdapter = null;
        this.bot = bot;
    }
    /**
     * Sends message to channel
     */
    send(channelId, message) {
        return this.bot.client.send(channelId, message);
    }
    /**
     * Send direct message to user
     * @param {Function} [failCallback] callback called if fails to send
     */
    sendDM(userId, message, failCallback) {
        return this.bot.client.sendDM(userId, message, failCallback);
    }
    /**
     * Gets the channel with channelId
     */
    getChannel(channelId) {
        return this.bot.client.getChannel(channelId);
    }
    /**
     * Gets server from channelId
     * @param {String} channelId id of channel
     */
    getServerFromChannel(channelId) {
        return this.bot.client.getServerFromChannel(channelId);
    }
    /**
     * Gets the server with serverId
     * @param {String} serverId id of server
     * @returns {Guild}
     */
    getServer(serverId) {
        return this.bot.client.getServer(serverId);
    }
    /**
     * Gets user
     * @param {String} userId id of user
     */
    getUser(userId) {
        return this.bot.client.getUser(userId);
    }
    /**
     * Gets a role in a server
     * @param {String} roleId id of role
     * @param {String} serverId id of server
     * @returns {Role}
     */
    getRole(roleId, serverId) {
        return this.bot.client.getRole(roleId, serverId);
    }
    /**
     * Gets user from server
     * @param {String} userId id of user
     * @param {String} serverId id of server
     */
    getMemberFromServer(userId, serverId) {
        return this.bot.client.getMemberFromServer(userId, serverId);
    }
    /**
     * @returns {Number} ping
     */
    getPing() {
        return this.bot.client.getPing();
    }
    /**
     * Attaches raw event adapter to hook
     * @param {RawEventAdapter} rawEventAdapter
     */
    attachRawEventAdapter(rawEventAdapter) {
        this.rawEventAdapter = rawEventAdapter;
    }
    attachMemory(memory) {
        this.memory = memory;
    }
    attachConfig(config) {
        this.config = config;
    }
    attachEvents(events) {
        this.events = events;
    }
    attachPermissions(permissions) {
        this.permissions = permissions;
    }
    attachCommandManager(commandManager) {
        this.commandManager = commandManager;
    }
    attachClient(client) {
        this.client = client;
    }
    newAsyncRequest() {
        this.bot.newAsyncRequest();
    }
    doneAsyncRequest() {
        this.bot.doneAsyncRequest();
    }
    dispatchEvent(name, event) {
        this.bot.events.dispatch(name, event);
    }
}
exports.default = BotHooks;
