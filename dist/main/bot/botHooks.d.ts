import Memory from "./botMemory";
import Config from "./botConfig";
import BotEvent from "./botEvents";
import BotPermissions from "./botPermissions";
import BotClient from "./botClient";
import Bot from "./bot";
import RawEventAdapter from "../adapters/rawEventAdapter";
import { Channel, Guild, Role, User, GuildMember, Message } from "discord.js";
import BotEvents from "./botEvents.js";
import EventName from "./eventName";
import PrecommandManager from "./precommand/manager/precommandManager";
import PluginManager from "./plugin/manager/pluginManager";
import { PrecommandWithoutCallback } from "./precommand/precommand";
import MessageObject from "./messageObject";
import EventHandler from "./eventHandler";
declare class BotHooks {
    memory: Memory;
    config: Config;
    events: BotEvent;
    permissions: BotPermissions;
    precommandManager: PrecommandManager;
    pluginManager: PluginManager;
    client: BotClient;
    rawEventAdapter: RawEventAdapter;
    defaultPrecommand: PrecommandWithoutCallback;
    bot: Bot;
    constructor(bot: Bot);
    /**
     * Sends message to channel
     */
    send(channelId: string, message: string | MessageObject): Promise<Message | Message[]>;
    /**
     * Send direct message to user
     * @param [failCallback] callback called if fails to send
     */
    sendDM(userId: string, message: string | MessageObject, failCallback?: Function): Promise<Message | Message[]>;
    /**
     * Gets the channel with channelId
     */
    getChannel(channelId: string): Channel | undefined;
    /**
     * Gets server from channelId
     * @param channelId id of channel
     */
    getServerFromChannel(channelId: string): Guild | undefined;
    /**
     * Gets the server with serverId
     * @param serverId id of server
     */
    getServer(serverId: string): Guild | undefined;
    /**
     * Gets user
     * @param userId id of user
     */
    getUser(userId: string): User | undefined;
    /**
     * Gets a role in a server
     * @param roleId id of role
     * @param serverId id of server
     */
    getRole(roleId: string, serverId: string): Role | undefined;
    /**
     * Gets user from server
     * @param userId id of user
     * @param serverId id of server
     */
    getMemberFromServer(userId: string, serverId: string): GuildMember | undefined;
    /**
     * @returns ping
     */
    getPing(): number;
    /**
     * Attaches raw event adapter to hook
     * @param rawEventAdapter
     */
    attachRawEventAdapter(rawEventAdapter: RawEventAdapter): void;
    attachMemory(memory: Memory): void;
    attachConfig(config: Config): void;
    attachEvents(events: BotEvents): void;
    attachPermissions(permissions: BotPermissions): void;
    attachPrecommandManager(precommandManager: PrecommandManager): void;
    attachPluginManager(pluginManager: PluginManager): void;
    attachDefaultPrecommand(defaultPrecommand: PrecommandWithoutCallback): void;
    attachClient(client: BotClient): void;
    newAsyncRequest(): void;
    doneAsyncRequest(): void;
    addEventListener(name: EventName, callback: EventHandler): void;
    dispatchEvent(name: EventName, event: any): void;
}
export default BotHooks;
