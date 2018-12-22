import Memory from "./botMemory";
import Config from "./botConfig";
import BotEvent from "./botEvents";
import BotPermissions from "./botPermissions";
import BotClient from "./botClient";
import Bot from "./bot";
import RawEventAdapter from "../adapters/rawEventAdapter";
import { Channel, Guild, Role, User } from "discord.js";
import BotEvents from "./botEvents.js";
import EventName from "./eventName";
import PrecommandManager from "./precommand/manager/precommandManager";
import PluginManager from "./plugin/manager/pluginManager";
import Precommand from "./precommand/precommand";
declare class BotHooks {
    memory: Memory;
    config: Config;
    events: BotEvent;
    permissions: BotPermissions;
    precommandManager: PrecommandManager;
    pluginManager: PluginManager;
    client: BotClient;
    rawEventAdapter: RawEventAdapter;
    defaultPrecommand: Precommand;
    bot: Bot;
    constructor(bot: Bot);
    /**
     * Sends message to channel
     */
    send(channelId: string, message: string | object): Promise<any>;
    /**
     * Send direct message to user
     * @param [failCallback] callback called if fails to send
     */
    sendDM(userId: string, message: string | object, failCallback?: Function): Promise<any>;
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
    getMemberFromServer(userId: string, serverId: string): import("discord.js").GuildMember | undefined;
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
    attachDefaultPrecommand(defaultPrecommand: Precommand): void;
    attachClient(client: BotClient): void;
    newAsyncRequest(): void;
    doneAsyncRequest(): void;
    dispatchEvent(name: EventName, event: any): void;
}
export default BotHooks;
