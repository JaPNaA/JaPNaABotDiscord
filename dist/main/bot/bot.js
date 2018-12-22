"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const botHooks_js_1 = __importDefault(require("./botHooks.js"));
const botMemory_js_1 = __importDefault(require("./botMemory.js"));
const rawEventAdapter_js_1 = __importDefault(require("../adapters/rawEventAdapter.js"));
const botConfig_js_1 = __importDefault(require("./botConfig.js"));
const botPermissions_js_1 = __importDefault(require("./botPermissions.js"));
const botEvents_js_1 = __importDefault(require("./botEvents.js"));
const commandManager_js_1 = __importDefault(require("./command/commandManager.js"));
const botClient_js_1 = __importDefault(require("./botClient.js"));
const logger_js_1 = __importDefault(require("../logger.js"));
const commandOptions_js_1 = __importDefault(require("./precommand/command/commandOptions.js"));
class Bot {
    constructor(config, memory, memoryPath, client, restartFunc) {
        /**
         * Function to call to restart itself
         */
        this.restartFunc = restartFunc;
        /**
         * Hooks that can be sent to objects
         */
        this.hooks = new botHooks_js_1.default(this);
        /**
         * Adapts raw discord.js events to our own
         */
        this.rawEventAdapter = new rawEventAdapter_js_1.default(this.hooks);
        this.hooks.attachRawEventAdapter(this.rawEventAdapter);
        /**
         * Bot config - gets configuration settings
         */
        this.config = new botConfig_js_1.default(this.hooks, config);
        this.hooks.attachConfig(this.config);
        /**
         * Bot memory - handles remembering things
         */
        this.memory = new botMemory_js_1.default(this.hooks, memoryPath, memory);
        this.hooks.attachMemory(this.memory);
        /**
         * Bot permission - handles getting and setting permissions
         */
        this.permissions = new botPermissions_js_1.default(this.hooks);
        this.hooks.attachPermissions(this.permissions);
        /**
         * Bot events - handles handling events
         */
        this.events = new botEvents_js_1.default(this.hooks);
        this.hooks.attachEvents(this.events);
        /**
         * Bot command manager - manages registering commands and dispatching
         */
        this.commandManager = new commandManager_js_1.default(this.hooks);
        this.hooks.attachCommandManager(this.commandManager);
        /**
         * Bot client - handles sending and receiving messages
         */
        this.client = new botClient_js_1.default(this.hooks, client);
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
    hasActiveAsyncRequests() {
        return this.activeAsnycRequests > 0;
    }
    /** Starts the bot */
    start() {
        logger_js_1.default.log("Bot starting...");
        this.registerCommandsAndPrecommands();
        logger_js_1.default.setLevel(this.config.loggingLevel);
        this.memory.startAutoWrite();
        if (this.client.isReady()) {
            this.onReady();
        }
        else {
            this.events.on("ready", this.onReady.bind(this));
        }
    }
    registerCommandsAndPrecommands() {
        this.commandManager.register.command("restart", "bot", this.restart.bind(this), new commandOptions_js_1.default({
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
    restart(bot, event) {
        bot.client.send(event.channelId, "**Restarting**");
        logger_js_1.default.log("Restarting");
        this.stop();
        this.restartFunc();
    }
    /**
     * ready callback
     */
    onReady() {
        this.events.dispatch("start", null);
        logger_js_1.default.log("Started");
    }
    /** called on command by onmessage */
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
exports.default = Bot;
