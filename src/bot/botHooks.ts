import Memory from "./botMemory";

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
    memory?: Memory;
    config?: Config;
    events?: BotEvent;
    permissions?: BotPermissions;
    commandManager?: CommandManager;
    client?: BotClient;
    bot: Bot;
    rawEventAdapter?: RawEventAdapter;

    /**
     * @param {Bot} bot
     */
    constructor(bot: Bot) {
        this.bot = bot;
    }

    /**
     * Sends message to channel
     * @param {String} channelId id of channel
     * @param {String | Object} message message to send
     */
    send(channelId: string, message: string | object) {
        return this.bot.client.send(channelId, message);
    }

    /**
     * Send direct message to user
     * @param {String} userId id of user
     * @param {String | Object} message message to send to user
     * @param {Function} [failCallback] callback called if fails to send
     */
    sendDM(userId: string, message: string | object, failCallback: Function) {
        return this.bot.client.sendDM(userId, message, failCallback);
    }



    /**
     * Gets the channel with channelId
     * @param {String} channelId
     * @returns {Channel}
     */
    getChannel(channelId: string): Channel {
        return this.bot.client.getChannel(channelId);
    }

    /**
     * Gets server from channelId
     * @param {String} channelId id of channel
     */
    getServerFromChannel(channelId: string) {
        return this.bot.client.getServerFromChannel(channelId);
    }

    /**
     * Gets the server with serverId
     * @param {String} serverId id of server
     * @returns {Guild}
     */
    getServer(serverId: string): Guild {
        return this.bot.client.getServer(serverId);
    }

    /**
     * Gets user
     * @param {String} userId id of user
     */
    getUser(userId: string) {
        return this.bot.client.getUser(userId);
    }

    /**
     * Gets a role in a server
     * @param {String} roleId id of role
     * @param {String} serverId id of server
     * @returns {Role}
     */
    getRole(roleId: string, serverId: string): Role {
        return this.bot.client.getRole(roleId, serverId);
    }

    /**
     * Gets user from server
     * @param {String} userId id of user
     * @param {String} serverId id of server
     */
    getMemberFromServer(userId: string, serverId: string) {
        return this.bot.client.getMemberFromServer(userId, serverId);
    }

    /**
     * @returns {Number} ping
     */
    getPing(): number {
        return this.bot.client.getPing();
    }



    /**
     * Attaches raw event adapter to hook
     * @param {RawEventAdapter} rawEventAdapter 
     */
    attachRawEventAdapter(rawEventAdapter: RawEventAdapter) {
        this.rawEventAdapter = rawEventAdapter;
    }

    attachMemory(memory: Memory) {
        this.memory = memory;
    }

    attachConfig(config: Config) {
        this.config = config;
    }

    attachEvents(events: BotEvents) {
        this.events = events;
    }

    attachPermissions(permissions: BotPermissions) {
        this.permissions = permissions;
    }

    attachCommandManager(commandManager: CommandManager) {
        this.commandManager = commandManager;
    }

    attachClient(client: BotClient) {
        this.client = client;
    }


    newAsyncRequest() {
        this.bot.newAsyncRequest();
    }

    doneAsyncRequest() {
        this.bot.doneAsyncRequest();
    }

    
    dispatchEvent(name: EventName, event: any) {
        this.bot.events.dispatch(name, event);
    }
}

export default BotHooks;