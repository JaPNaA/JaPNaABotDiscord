import { Client } from "discord.js";
import BotHooks from "./botHooks.js";
import BotMemory from "./botMemory.js";
import RawEventAdapter from "../../adapters/rawEventAdapter.js";
import BotConfig from "./botConfig.js";
import BotPermissions from "./botPermissions.js";
import BotEvents from "./botEvents.js";
import BotClient from "./botClient.js";
import DiscordCommandEvent from "../events/discordCommandEvent.js";
import PrecommandManager from "../precommand/manager/precommandManager.js";
import { PrecommandWithoutCallback } from "../precommand/precommand.js";
import PluginManager from "../plugin/manager/pluginManager.js";
declare class Bot {
    restartFunc: Function;
    hooks: BotHooks;
    rawEventAdapter: RawEventAdapter;
    config: BotConfig;
    memory: BotMemory;
    permissions: BotPermissions;
    events: BotEvents;
    precommandManager: PrecommandManager;
    pluginManager: PluginManager;
    client: BotClient;
    activeAsnycRequests: number;
    defaultPrecommand: PrecommandWithoutCallback;
    constructor(config: object, memory: object, memoryPath: string, client: Client, restartFunc: Function);
    /**
     * Add new asnyc request to wait for
     */
    newAsyncRequest(): void;
    /**
     * Remove asnyc request to wait for
     */
    doneAsyncRequest(): void;
    /** Checks if there're more active asnyc requests */
    hasActiveAsyncRequests(): boolean;
    /** Starts the bot */
    start(): void;
    registerDefaultPrecommands(): void;
    /**
     * Stops the bot (async)
     */
    stop(): void;
    /** Restarts bot on command */
    restart(bot: BotHooks, event: DiscordCommandEvent): void;
    /**
     * ready callback
     */
    onReady(): void;
}
export default Bot;
