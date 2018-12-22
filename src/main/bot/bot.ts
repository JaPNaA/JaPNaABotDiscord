import { Client } from "discord.js";
import BotHooks from "./botHooks.js";
import BotMemory from "./botMemory.js";
import RawEventAdapter from "../adapters/rawEventAdapter.js";
import BotConfig from "./botConfig.js";
import BotPermissions from "./botPermissions.js";
import BotEvents from "./botEvents.js";
import CommandManager from "./command/commandManager.js";
import BotClient from "./botClient.js";
import Logger from "../logger.js";
import BotCommandOptions from "./precommand/command/commandOptions.js";
import { DiscordCommandEvent } from "../events.js";

class Bot {
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
         * Bot permission - handles getting and setting permissions
         */
        this.permissions = new BotPermissions(this.hooks);
        this.hooks.attachPermissions(this.permissions);

        /**
         * Bot events - handles handling events
         */
        this.events = new BotEvents(this.hooks);
        this.hooks.attachEvents(this.events);

        /**
         * Bot command manager - manages registering commands and dispatching
         */
        this.commandManager = new CommandManager(this.hooks);
        this.hooks.attachCommandManager(this.commandManager);

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
    newAsyncRequest() {
        this.activeAsnycRequests++;
        this.events.dispatch("addasync", this.activeAsnycRequests);
    }

    /**
     * Remove asnyc request to wait for
     */
    doneAsyncRequest() {
        this.activeAsnycRequests--;
        this.events.dispatch("doneasync", this.activeAsnycRequests);
    }

    /** Checks if there're more active asnyc requests */
    hasActiveAsyncRequests(): Boolean {
        return this.activeAsnycRequests > 0;
    }

    /** Starts the bot */
    start() {
        Logger.log("Bot starting...");

        this.registerCommandsAndPrecommands();
        Logger.setLevel(this.config.loggingLevel);
        this.memory.startAutoWrite();

        if (this.client.isReady()) {
            this.onReady();
        } else {
            this.events.on("ready", this.onReady.bind(this));
        }
    }

    registerCommandsAndPrecommands() {
        this.commandManager.register.command("restart", "bot", this.restart.bind(this), new BotCommandOptions({
            requiredPermission: "BOT_ADMINISTRATOR"
        }));

        for (let precommand of this.config.precommands) {
            this.commandManager.register.precommand(precommand, this.onBotPrecommandCommand.bind(this));
        }
    }

    /**
     * Stops the bot (async)
     */
    stop() {
        this.commandManager.register.unregisterAllPlugins();

        this.events.dispatch("stop", null);

        this.memory.writeOut_auto();
    }

    /** Restarts bot on command */
    restart(bot: BotHooks, event: DiscordCommandEvent) {
        bot.client.send(event.channelId, "**Restarting**");
        Logger.log("Restarting");
        this.stop();
        this.restartFunc();
    }

    /**
     * ready callback
     */
    onReady() {
        this.events.dispatch("start", null);
        Logger.log("Started");
    }

    /** called on command by onmessage */
    onBotPrecommandCommand(commandEvent: DiscordCommandEvent) {
        this.events.dispatch("command", commandEvent);

        let someCommandRan = false;

        for (let i = this.commandManager.commands.length - 1; i >= 0; i--) {
            let command = this.commandManager.commands[i];
            let ran = command.testAndRun(commandEvent);
            if (ran) {
                someCommandRan = true;
                break;
            }
        }

        if (!someCommandRan) {
            // command doesn't exist
            if (this.config.doAlertCommandDoesNotExist) {
                this.client.send(commandEvent.channelId, "<@" + commandEvent.userId + ">, that command doesn't exist");
            }
        }
    }
}

export default Bot;