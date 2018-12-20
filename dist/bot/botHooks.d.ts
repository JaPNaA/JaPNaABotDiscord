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
declare class BotHooks {
    /**
     * @param {Bot} bot
     */
    constructor(bot: any);
    /**
     * Sends message to channel
     * @param {String} channelId id of channel
     * @param {String | Object} message message to send
     */
    send(channelId: any, message: any): any;
    /**
     * Send direct message to user
     * @param {String} userId id of user
     * @param {String | Object} message message to send to user
     * @param {Function} [failCallback] callback called if fails to send
     */
    sendDM(userId: any, message: any, failCallback: any): any;
    /**
     * Gets the channel with channelId
     * @param {String} channelId
     * @returns {Channel}
     */
    getChannel(channelId: any): any;
    /**
     * Gets server from channelId
     * @param {String} channelId id of channel
     */
    getServerFromChannel(channelId: any): any;
    /**
     * Gets the server with serverId
     * @param {String} serverId id of server
     * @returns {Guild}
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
     * @returns {Role}
     */
    getRole(roleId: any, serverId: any): any;
    /**
     * Gets user from server
     * @param {String} userId id of user
     * @param {String} serverId id of server
     */
    getMemberFromServer(userId: any, serverId: any): any;
    /**
     * @returns {Number} ping
     */
    getPing(): any;
    /**
     * Attaches raw event adapter to hook
     * @param {RawEventAdapter} rawEventAdapter
     */
    attachRawEventAdapter(rawEventAdapter: any): void;
    /**
     * Attaches memory to hook
     * @param {Memory} memory
     */
    attachMemory(memory: any): void;
    /**
     * Attaches config to hook
     * @param {Config} config
     */
    attachConfig(config: any): void;
    /**
     * Attaches events to hook
     * @param {Events} events
     */
    attachEvents(events: any): void;
    /**
     * Attaches permissions to hook
     * @param {Permissions} permissions
     */
    attachPermissions(permissions: any): void;
    /**
     * Attaches command manager to hook
     * @param {CommandManager} commandManager
     */
    attachCommandManager(commandManager: any): void;
    /**
     * Attaches client to hook
     * @param {BotClient} client
     */
    attachClient(client: any): void;
    /**
     * Add new asnyc request to wait for
     */
    newAsyncRequest(): void;
    /**
     * Remove asnyc request to wait for
     */
    doneAsyncRequest(): void;
    /**
     * Call all event handlers for event
     * @param {EventName} name of event
     * @param {*} event Event data sent with dispatch
     */
    dispatchEvent(name: any, event: any): void;
}
