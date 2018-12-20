import { Client } from "discord.js";
import BotHooks from "./botHooks.js";
import BotMemory from "./botMemory.js";
import RawEventAdapter from "../adapters/rawEventAdapter.js";
import BotConfig from "./botConfig.js";
import BotPermissions from "./botPermissions.js";
import BotEvents from "./botEvents.js";
import CommandManager from "./command/commandManager.js";
import BotClient from "./botClient.js";
import { DiscordCommandEvent } from "../events.js";
declare class Bot {
    restartFunc: Function;
    hooks: BotHooks;
    rawEventAdapter: RawEventAdapter;
    config: BotConfig;
    memory: BotMemory;
    permissions: BotPermissions;
    events: BotEvents;
    commandManager: CommandManager;
    client: BotClient;
    activeAsnycRequests: number;
    id: undefined | string;
    constructor(config: object, memory: object, memoryPath: string, client: Client, restartFunc: Function);
    /**
     * Add new asnyc request to wait for
     */
    newAsyncRequest(): void;
    /**
     * Remove asnyc request to wait for
     */
    doneAsyncRequest(): void;
    /**
     * Checks if there're more active asnyc requests
     * @returns {Boolean}
     */
    hasActiveAsyncRequests(): boolean;
    /**
     * Starts the bot
     */
    start(): void;
    registerCommandsAndPrecommands(): void;
    /**
     * Stops the bot (async)
     */
    stop(): void;
    /**
     * Restarts bot on command
     * @param {BotHooks} bot this
     * @param {DiscordMessageEvent} event data
     */
    restart(bot: BotHooks, event: DiscordCommandEvent): void;
    /**
     * ready callback
     */
    onReady(): void;
    /**
     * called on command by onmessage
     * @param {DiscordCommandEvent} commandEvent message information
     */
    onBotPrecommandCommand(commandEvent: DiscordCommandEvent): void;
}
export default Bot;
