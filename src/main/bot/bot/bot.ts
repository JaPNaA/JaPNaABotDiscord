import { Client } from "discord.js";
import BotMemory from "./botMemory.js";
import RawEventAdapter from "../../adapters/rawEventAdapter.js";
import BotConfig from "./botConfig.js";
import BotPermissions from "./botPermissions.js";
import BotEvents from "./botEvents.js";
import BotClient from "./botClient.js";
import Logger from "../../utils/logger.js";
import BotCommandOptions from "../command/commandOptions.js";
import DiscordCommandEvent from "../events/discordCommandEvent.js";
import PrecommandManager from "../precommand/manager/precommandManager.js";
import { Precommand, PrecommandWithoutCallback, PrecommandWithCallback } from "../precommand/precommand.js";
import PluginManager from "../plugin/manager/pluginManager.js";
import BotCommandHelp from "../command/commandHelp.js";
import { inspect } from "util";
import ellipsisize from "../../utils/str/ellipsisize.js";

class Bot {
    restartFunc: Function;
    rawEventAdapter: RawEventAdapter;
    config: BotConfig;
    memory: BotMemory;
    permissions: BotPermissions;
    events: BotEvents;

    precommandManager: PrecommandManager;
    pluginManager: PluginManager;

    client: BotClient;

    activeAsnycRequests: number;

    // @ts-ignore this is assigned normally, and it's too much work to make it possibly undefined
    defaultPrecommand: PrecommandWithoutCallback;

    constructor(config: object, memory: object, memoryPath: string, client: Client, restartFunc: Function) {
        /**
         * Function to call to restart itself
         */
        this.restartFunc = restartFunc;

        /**
         * Adapts raw discord.js events to our own
         */
        this.rawEventAdapter = new RawEventAdapter(this);

        /**
         * Bot config - gets configuration settings
         */
        this.config = new BotConfig(this, config);

        /**
         * Bot memory - handles remembering things
         */
        this.memory = new BotMemory(this, memoryPath, memory);

        /**
         * Bot permissions - gets permissions
         */
        this.permissions = new BotPermissions(this);

        /**
         * Bot events - handles handling events
         */
        this.events = new BotEvents(this);

        /**
         * Bot precommand manager - manages registering and dispatching precommands
         */
        this.precommandManager = new PrecommandManager(this);

        /**
         * Bot plugin manager - registers plugins
         */
        this.pluginManager = new PluginManager(this);

        /**
         * Bot client - handles sending and receiving messages
         */
        this.client = new BotClient(this, client);

        /**
         * How many active asnyc requests are running
         */
        this.activeAsnycRequests = 0;

        this.start();
    }

    /**
     * Add new asnyc request to wait for
     */
    public newAsyncRequest(): void {
        this.activeAsnycRequests++;
        this.events.dispatch("addasync", this.activeAsnycRequests);
    }

    /**
     * Remove asnyc request to wait for
     */
    public doneAsyncRequest(): void {
        this.activeAsnycRequests--;
        this.events.dispatch("doneasync", this.activeAsnycRequests);
    }

    /** Checks if there're more active asnyc requests */
    public hasActiveAsyncRequests(): boolean {
        return this.activeAsnycRequests > 0;
    }

    /** Starts the bot */
    public start(): void {
        if (this.config.debugMode) {
            this.startDebugMode();
        } else {
            this.startNormally();
        }
    }

    private startNormally() {
        Logger.log("Bot starting...");

        this.registerDefaultPrecommands();
        Logger.setLevel(this.config.loggingLevel);
        this.memory.startAutoWrite();

        this.listenForClientReady();
    }

    private startDebugMode() {
        Logger.log("Bot starting in debug mode...");

        this.registerDebugPrecommands();
        Logger.setLevel(4);

        this.listenForClientReady();
    }

    private listenForClientReady() {
        if (this.client.isReady()) {
            this.onReady();
        } else {
            this.events.on("ready", this.onReady.bind(this));
        }
    }

    private registerDefaultPrecommands(): void {
        const precommandStrs: string[] = this.config.precommands;
        const precommand: PrecommandWithoutCallback = Precommand.create(this, precommandStrs);

        this.defaultPrecommand = precommand;
        this.precommandManager.register(precommand);

        this.registerDefaultCommands();
    }

    private registerDefaultCommands() {
        this.defaultPrecommand.commandManager.register(
            "restart", "bot", this.restart.bind(this),
            new BotCommandOptions({
                help: new BotCommandHelp({
                    description: "Restarts the bot"
                }),
                requiredPermission: "BOT_ADMINISTRATOR",
                group: "Utils"
            })
        );
    }

    private registerDebugPrecommands() {
        const precommand: PrecommandWithCallback =
            Precommand.create(this, this.config.debugPrecommand, this.debugPrecommandCallback.bind(this));

        this.precommandManager.register(precommand);
    }

    private debugPrecommandCallback(event: DiscordCommandEvent) {
        try {
            let str: string = inspect(eval(event.commandContent));
            str = ellipsisize(str.replace(/ {4}/g, "\t"), 1994);
            this.client.send(event.channelId, "```" + str + "```");
        } catch (err) {
            let str: string = (err as Error).stack || "";
            str = ellipsisize(str.replace(/ {4}/g, "\t"), 1994);
            this.client.send(event.channelId, "```" + str + "```");
        }
    }

    /**
     * Stops the bot (async)
     */
    public stop(): void {
        this.pluginManager.unregisterAllPlugins();
        this.events.dispatch("stop", null);
        this.memory.writeOut();
    }

    /** Restarts bot on command */
    public restart(bot: Bot, event: DiscordCommandEvent): void {
        bot.client.send(event.channelId, "**Restarting**");
        Logger.log("Restarting");
        this.stop();
        this.restartFunc();
    }

    /**
     * ready callback
     */
    private onReady(): void {
        this.events.dispatch("start", null);
        Logger.log("Started");
    }
}

export default Bot;