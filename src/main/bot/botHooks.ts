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
import MessageObject from "./messageObject";


class BotHooks {
    // Workaround and hacks below.
    memory: Memory = null as any as Memory;
    config: Config = null as any as Config;
    events: BotEvent = null as any as BotEvent;
    permissions: BotPermissions = null as any as BotPermissions;
    precommandManager: PrecommandManager = null as any as PrecommandManager;
    pluginManager: PluginManager = null as any as PluginManager;
    client: BotClient = null as any as BotClient;
    rawEventAdapter: RawEventAdapter = null as any as RawEventAdapter;
    defaultPrecommand: Precommand = null as any as Precommand;

    bot: Bot;

    constructor(bot: Bot) {
        this.bot = bot;
    }

    /**
     * Sends message to channel
     */
    send(channelId: string, message: string | MessageObject) {
        return this.bot.client.send(channelId, message);
    }

    /**
     * Send direct message to user
     * @param [failCallback] callback called if fails to send
     */
    sendDM(userId: string, message: string | MessageObject, failCallback?: Function) {
        return this.bot.client.sendDM(userId, message, failCallback);
    }



    /**
     * Gets the channel with channelId
     */
    getChannel(channelId: string): Channel | undefined {
        return this.bot.client.getChannel(channelId);
    }

    /**
     * Gets server from channelId
     * @param channelId id of channel
     */
    getServerFromChannel(channelId: string): Guild | undefined {
        return this.bot.client.getServerFromChannel(channelId);
    }

    /**
     * Gets the server with serverId
     * @param serverId id of server
     */
    getServer(serverId: string): Guild | undefined {
        return this.bot.client.getServer(serverId);
    }

    /**
     * Gets user
     * @param userId id of user
     */
    getUser(userId: string): User | undefined {
        return this.bot.client.getUser(userId);
    }

    /**
     * Gets a role in a server
     * @param roleId id of role
     * @param serverId id of server
     */
    getRole(roleId: string, serverId: string): Role | undefined {
        return this.bot.client.getRole(roleId, serverId);
    }

    /**
     * Gets user from server
     * @param userId id of user
     * @param serverId id of server
     */
    getMemberFromServer(userId: string, serverId: string) {
        return this.bot.client.getMemberFromServer(userId, serverId);
    }

    /**
     * @returns ping
     */
    getPing(): number {
        return this.bot.client.getPing();
    }



    /**
     * Attaches raw event adapter to hook
     * @param rawEventAdapter 
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

    attachPrecommandManager(precommandManager: PrecommandManager) {
        this.precommandManager = precommandManager;
    }

    attachPluginManager(pluginManager: PluginManager) {
        this.pluginManager = pluginManager;
    }

    attachDefaultPrecommand(defaultPrecommand: Precommand) {
        this.defaultPrecommand = defaultPrecommand;
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