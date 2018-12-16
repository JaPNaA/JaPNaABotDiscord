/**
 * @typedef {import("./bot.js")} Bot
 * @typedef {import("./memory/botMemory.js")} Memory
 * @typedef {import("./botConfig.js")} Config
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
         * The bot to reference
         * @type {Bot}
         */
        this.bot = bot;
    }


    /**
     * Gets the channel with channelId
     * @param {String} channelId
     * @returns {Channel}
     */
    getChannel(channelId) {
        return this.bot.client.channels.get(channelId);
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
     * @returns {Guild}
     */
    getServer(serverId) {
        return this.bot.client.guilds.get(serverId);
    }

    /**
     * Gets user
     * @param {String} userId id of user
     */
    getUser(userId) {
        return this.bot.client.users.get(userId);
    }

    /**
     * Gets a role in a server
     * @param {String} roleId id of role
     * @param {String} serverId id of server
     * @returns {Role}
     */
    getRole(roleId, serverId) {
        return this.bot.getRole(roleId, serverId);
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
     * @param {String} name of event
     * @param {*} event Event data sent with dispatch
     */
    dispatchEvent(name, event) {
        this.bot.dispatchEvent(name, event);
    }
}

module.exports = BotHooks;