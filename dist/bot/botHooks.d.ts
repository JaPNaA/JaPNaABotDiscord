import Memory from "./botMemory";
import Config from "./botConfig";
import BotEvent from "./botEvents";
import BotPermissions from "./botPermissions";
import CommandManager from "./command/commandManager";
import BotClient from "./botClient";
import Bot from "./bot";
import RawEventAdapter from "../adapters/rawEventAdapter";
import { Channel, Guild, Role, User } from "discord.js";
import BotEvents from "./botEvents.js";
import EventName from "./eventName";
declare class BotHooks {
    memory: Memory;
    config: Config;
    events: BotEvent;
    permissions: BotPermissions;
    commandManager: CommandManager;
    client: BotClient;
    rawEventAdapter: RawEventAdapter;
    bot: Bot;
    /**
     * @param {Bot} bot
     */
    constructor(bot: Bot);
    /**
     * Sends message to channel
     */
    send(channelId: string, message: string | object): Promise<any>;
    /**
     * Send direct message to user
     * @param {Function} [failCallback] callback called if fails to send
     */
    sendDM(userId: string, message: string | object, failCallback?: Function): Promise<any>;
    /**
     * Gets the channel with channelId
     */
    getChannel(channelId: string): Channel | undefined;
    /**
     * Gets server from channelId
     * @param {String} channelId id of channel
     */
    getServerFromChannel(channelId: string): Guild | undefined;
    /**
     * Gets the server with serverId
     * @param {String} serverId id of server
     * @returns {Guild}
     */
    getServer(serverId: string): Guild | undefined;
    /**
     * Gets user
     * @param {String} userId id of user
     */
    getUser(userId: string): User | undefined;
    /**
     * Gets a role in a server
     * @param {String} roleId id of role
     * @param {String} serverId id of server
     * @returns {Role}
     */
    getRole(roleId: string, serverId: string): Role | undefined;
    /**
     * Gets user from server
     * @param {String} userId id of user
     * @param {String} serverId id of server
     */
    getMemberFromServer(userId: string, serverId: string): import("discord.js").GuildMember | undefined;
    /**
     * @returns {Number} ping
     */
    getPing(): number;
    /**
     * Attaches raw event adapter to hook
     * @param {RawEventAdapter} rawEventAdapter
     */
    attachRawEventAdapter(rawEventAdapter: RawEventAdapter): void;
    attachMemory(memory: Memory): void;
    attachConfig(config: Config): void;
    attachEvents(events: BotEvents): void;
    attachPermissions(permissions: BotPermissions): void;
    attachCommandManager(commandManager: CommandManager): void;
    attachClient(client: BotClient): void;
    newAsyncRequest(): void;
    doneAsyncRequest(): void;
    dispatchEvent(name: EventName, event: any): void;
}
export default BotHooks;
