"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BotHooks {
    constructor(bot) {
        // workaround and hacks below.
        this.memory = null;
        this.config = null;
        this.events = null;
        this.permissions = null;
        this.precommandManager = null;
        this.pluginManager = null;
        this.client = null;
        this.rawEventAdapter = null;
        this.defaultPrecommand = null;
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
     * @param [failCallback] callback called if fails to send
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
     * @param channelId id of channel
     */
    getServerFromChannel(channelId) {
        return this.bot.client.getServerFromChannel(channelId);
    }
    /**
     * Gets the server with serverId
     * @param serverId id of server
     */
    getServer(serverId) {
        return this.bot.client.getServer(serverId);
    }
    /**
     * Gets user
     * @param userId id of user
     */
    getUser(userId) {
        return this.bot.client.getUser(userId);
    }
    /**
     * Gets a role in a server
     * @param roleId id of role
     * @param serverId id of server
     */
    getRole(roleId, serverId) {
        return this.bot.client.getRole(roleId, serverId);
    }
    /**
     * Gets user from server
     * @param userId id of user
     * @param serverId id of server
     */
    getMemberFromServer(userId, serverId) {
        return this.bot.client.getMemberFromServer(userId, serverId);
    }
    /**
     * @returns ping
     */
    getPing() {
        return this.bot.client.getPing();
    }
    /**
     * Attaches raw event adapter to hook
     * @param rawEventAdapter
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
    attachPrecommandManager(precommandManager) {
        this.precommandManager = precommandManager;
    }
    attachPluginManager(pluginManager) {
        this.pluginManager = pluginManager;
    }
    attachDefaultPrecommand(defaultPrecommand) {
        this.defaultPrecommand = defaultPrecommand;
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
    addEventListener(name, callback) {
        this.bot.events.on(name, callback);
    }
    dispatchEvent(name, event) {
        this.bot.events.dispatch(name, event);
    }
}
exports.default = BotHooks;
