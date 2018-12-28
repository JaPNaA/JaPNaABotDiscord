import { Client } from "discord.js";
import BotHooks from "./botHooks.js";
import BotMemory from "./botMemory.js";
import RawEventAdapter from "../adapters/rawEventAdapter.js";
import BotConfig from "./botConfig.js";
import BotPermissions from "./botPermissions.js";
import BotEvents from "./botEvents.js";
import BotClient from "./botClient.js";
import Logger from "../logger.js";
import BotCommandOptions from "./command/commandOptions.js";
import { DiscordCommandEvent } from "../events.js";
import PrecommandManager from "./precommand/manager/precommandManager.js";
import { Precommand, PrecommandWithoutCallback } from "./precommand/precommand.js";
import PluginManager from "./plugin/manager/pluginManager.js";

class Bot {
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

    // @ts-ignore this IS assigned in the constructor, dumb dumb
    defaultPrecommand: PrecommandWithoutCallback;

    constructor(config: object, memory: object, memoryPath: string, client: Client, restartFunc: Function) {
        /**
         * Function to call to restart itself
         */
        this.restartFunc = restartFunc;

        /**
         * Hooks that can be sent to objects
         */
        this.hooks = new BotHooks(this);

        /**
         * Adapts raw discord.js events to our own
         */
        this.rawEventAdapter = new RawEventAdapter(this.hooks);
        this.hooks.attachRawEventAdapter(this.rawEventAdapter);

        /**
         * Bot config - gets configuration settings
         */
        this.config = new BotConfig(this.hooks, config);
        this.hooks.attachConfig(this.config);

        /**
         * Bot memory - handles remembering things
         */
        this.memory = new BotMemory(this.hooks, memoryPath, memory);
        this.hooks.attachMemory(this.memory);

        /**
         * Bot permissions - gets permissions
         */
        this.permissions = new BotPermissions(this.hooks);
        this.hooks.attachPermissions(this.permissions);

        /**
         * Bot events - handles handling events
         */
        this.events = new BotEvents(this.hooks);
        this.hooks.attachEvents(this.events);

        /**
         * Bot precommand manager - manages registering and dispatching precommands
         */
        this.precommandManager = new PrecommandManager(this.hooks);
        this.hooks.attachPrecommandManager(this.precommandManager);

        /**
         * Bot plugin manager - registers plugins
         */
        this.pluginManager = new PluginManager(this.hooks);
        this.hooks.attachPluginManager(this.pluginManager);

        /**
         * Bot client - handles sending and receiving messages
         */
        this.client = new BotClient(this.hooks, client);
        this.hooks.attachClient(this.client);

        /**
         * How many active asnyc requests are running
         */
        this.activeAsnycRequests = 0;

        this.start();
    }

    /**
     * Add new asnyc request to wait for
     */
    newAsyncRequest(): void {
        this.activeAsnycRequests++;
        this.events.dispatch("addasync", this.activeAsnycRequests);
    }

    /**
     * Remove asnyc request to wait for
     */
    doneAsyncRequest(): void {
        this.activeAsnycRequests--;
        this.events.dispatch("doneasync", this.activeAsnycRequests);
    }

    /** Checks if there're more active asnyc requests */
    hasActiveAsyncRequests(): boolean {
        return this.activeAsnycRequests > 0;
    }

    /** Starts the bot */
    start(): void {
        Logger.log("Bot starting...");

        this.registerDefaultPrecommands();
        Logger.setLevel(this.config.loggingLevel);
        this.memory.startAutoWrite();

        if (this.client.isReady()) {
            this.onReady();
        } else {
            this.events.on("ready", this.onReady.bind(this));
        }
    }

    registerDefaultPrecommands(): void {
        // TODO: refactor
        const precommandStrs: string[] = this.config.precommands;
        const precommand: PrecommandWithoutCallback = Precommand.create(this.hooks, precommandStrs);

        precommand.commandManager.register(
            "restart", "bot", this.restart.bind(this),
            new BotCommandOptions({
                requiredPermission: "BOT_ADMINISTRATOR"
            })
        );

        this.defaultPrecommand = precommand;
        this.precommandManager.register(precommand);
        this.hooks.attachDefaultPrecommand(precommand);
    }

    /**
     * Stops the bot (async)
     */
    stop(): void {
        this.pluginManager.unregisterAllPlugins();
        this.events.dispatch("stop", null);
        this.memory.writeOut();
    }

    /** Restarts bot on command */
    restart(bot: BotHooks, event: DiscordCommandEvent): void {
        bot.client.send(event.channelId, "**Restarting**");
        Logger.log("Restarting");
        this.stop();
        this.restartFunc();
    }

    /**
     * ready callback
     */
    onReady(): void {
        this.events.dispatch("start", null);
        Logger.log("Started");
    }
}

export default Bot;