import { Client } from "discord.js";
import BotHooks from "./botHooks.js";
import Memory from "./botMemory.js";

/**
 * @typedef {import("discord.js").Client} Client
 * @typedef {import("discord.js").Channel} Channel
 * @typedef {import("discord.js").TextChannel} TextChannel
 * @typedef {import("discord.js").Message} Message
 * @typedef {import("discord.js").User} User
 * @typedef {import("../botcommandOptions.js")} BotCommandOptions
 * @typedef {import("../plugin.js")} Plugin
 * @typedef {import("../botcommandHelp.js")} BotCommandHelp
 * @typedef {import("../precommand.js")} Precommand
 * @typedef {import("../events.js").DiscordMessageEvent} DiscordMessageEvent
 * @typedef {import("../events.js").DiscordCommandEvent} DiscordCommandEvent
 */

const Logger = require("../logger.js");

const BotCommandOptions = require("../botcommandOptions.js");

const RawEventAdapter = require("../adapters/rawEventAdapter.js");

const BotHooks = require("./botHooks.js");
const BotConfig = require("./botConfig.js");
const BotMemory = require("./botMemory.js");
const BotPermissions = require("./botPermissions.js");
const BotEvents = require("./botEvents.js");
const CommandManager = require("./command/commandManager.js");
const BotClient = require("./botClient.js");

class Bot {
    restartFunc: Function;
    hooks: BotHooks;
    rawEventAdapter: RawEventAdapter;
    config: Config;
    memory: Memory;
    permissions: BotPermissions;
    events: BotEvents;
    commandManager: CommandManager;
    client: Client;
    activeAsnycRequests: number;
    id: undefined | string;
    
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

    /**
     * Checks if there're more active asnyc requests
     * @returns {Boolean}
     */
    hasActiveAsyncRequests() {
        return this.activeAsnycRequests > 0;
    }

    /**
     * Starts the bot
     */
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

    /**
     * Restarts bot on command
     * @param {BotHooks} bot this
     * @param {DiscordMessageEvent} event data
     */
    restart(bot, event) {
        bot.client.send(event.channelId, "**Restarting**");
        Logger.log("Restarting");
        this.stop();
        this.restartFunc();
    }

    /**
     * ready callback
     */
    onReady() {
        this.id = this.client.id;
        this.events.dispatch("start", null);
        Logger.log("Started");
    }

    /**
     * called on command by onmessage
     * @param {DiscordCommandEvent} commandEvent message information
     */
    onBotPrecommandCommand(commandEvent) {
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