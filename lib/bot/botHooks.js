/**
 * @typedef {import("../bot/botEvents.js").EventName} EventName

 * @typedef {import("./bot.js")} Bot
 * @typedef {import("./botMemory.js")} Memory
 * @typedef {import("./botConfig.js")} Config
 * @typedef {import("./botEvents.js")} Events
 * @typedef {import("./botPermissions.js")} Permissions
 * @typedef {import("./command/commandManager")} CommandManager
 * @typedef {import("./botClient.js")} BotClient

 * @typedef {import("../adapters/rawEventAdapter.js")} RawEventAdapter

 * @typedef {import("discord.js").Client} Client
 * @typedef {import("discord.js").Channel} Channel
 * @typedef {import("discord.js").TextChannel} TextChannel
 * @typedef {import("discord.js").Message} Message
 * @typedef {import("discord.js").User} User
 * @typedef {import("discord.js").Role} Role
 * @typedef {import("discord.js").Guild} Guild
 */

class BotHooks {
    /**
     * @param {Bot} bot
     */
    constructor(bot) {
        /**
         * Bot memory
         * @type {Memory}
         */
        this.memory = null;

        /**
         * Bot config
         * @type {Config}
         */
        this.config = null;

        /**
         * Bot events
         * @type {Events}
         */
        this.events = null;

        /**
         * Bot permissions
         * @type {Permissions}
         */
        this.permissions = null;

        /**
         * Bot command manager
         * @type {CommandManager}
         */
        this.commandManager = null;

        /**
         * Bot client
         * @type {BotClient}
         */
        this.client = null;

        /**
         * The bot to reference
         * @type {Bot}
         */
        this.bot = bot;
    }



    /**
     * Sends message to channel
     * @param {String} channelId id of channel
     * @param {String | Object} message message to send
     */
    send(channelId, message) {
        return this.bot.client.send(channelId, message);
    }

    /**
     * Send direct message to user
     * @param {String} userId id of user
     * @param {String | Object} message message to send to user
     * @param {Function} [failCallback] callback called if fails to send
     */
    sendDM(userId, message, failCallback) {
        return this.bot.client.sendDM(userId, message, failCallback);
    }



    /**
     * Gets the channel with channelId
     * @param {String} channelId
     * @returns {Channel}
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

    /**
     * Attaches memory to hook
     * @param {Memory} memory
     */
    attachMemory(memory) {
        this.memory = memory;
    }

    /**
     * Attaches config to hook
     * @param {Config} config
     */
    attachConfig(config) {
        this.config = config;
    }

    /**
     * Attaches events to hook
     * @param {Events} events 
     */
    attachEvents(events) {
        this.events = events;
    }

    /**
     * Attaches permissions to hook
     * @param {Permissions} permissions
     */
    attachPermissions(permissions) {
        this.permissions = permissions;
    }

    /**
     * Attaches command manager to hook
     * @param {CommandManager} commandManager 
     */
    attachCommandManager(commandManager) {
        this.commandManager = commandManager;
    }

    /**
     * Attaches client to hook
     * @param {BotClient} client
     */
    attachClient(client) {
        this.client = client;
    }



    /**
     * Add new asnyc request to wait for
     */
    newAsyncRequest() {
        this.bot.newAsyncRequest();
    }

    /**
     * Remove asnyc request to wait for
     */
    doneAsyncRequest() {
        this.bot.doneAsyncRequest();
    }



    /**
     * Call all event handlers for event
     * @param {EventName} name of event
     * @param {*} event Event data sent with dispatch
     */
    dispatchEvent(name, event) {
        this.bot.events.dispatch(name, event);
    }
}

module.exports = BotHooks;