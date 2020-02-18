"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const botHooks_js_1 = __importDefault(require("./botHooks.js"));
const botMemory_js_1 = __importDefault(require("./botMemory.js"));
const rawEventAdapter_js_1 = __importDefault(require("../../adapters/rawEventAdapter.js"));
const botConfig_js_1 = __importDefault(require("./botConfig.js"));
const botPermissions_js_1 = __importDefault(require("./botPermissions.js"));
const botEvents_js_1 = __importDefault(require("./botEvents.js"));
const botClient_js_1 = __importDefault(require("./botClient.js"));
const logger_js_1 = __importDefault(require("../../utils/logger.js"));
const commandOptions_js_1 = __importDefault(require("../command/commandOptions.js"));
const precommandManager_js_1 = __importDefault(require("../precommand/manager/precommandManager.js"));
const precommand_js_1 = require("../precommand/precommand.js");
const pluginManager_js_1 = __importDefault(require("../plugin/manager/pluginManager.js"));
const commandHelp_js_1 = __importDefault(require("../command/commandHelp.js"));
const util_1 = require("util");
const ellipsisize_js_1 = __importDefault(require("../../utils/str/ellipsisize.js"));
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
         * Bot permissions - gets permissions
         */
        this.permissions = new botPermissions_js_1.default(this.hooks);
        this.hooks.attachPermissions(this.permissions);
        /**
         * Bot events - handles handling events
         */
        this.events = new botEvents_js_1.default(this.hooks);
        this.hooks.attachEvents(this.events);
        /**
         * Bot precommand manager - manages registering and dispatching precommands
         */
        this.precommandManager = new precommandManager_js_1.default(this.hooks);
        this.hooks.attachPrecommandManager(this.precommandManager);
        /**
         * Bot plugin manager - registers plugins
         */
        this.pluginManager = new pluginManager_js_1.default(this.hooks);
        this.hooks.attachPluginManager(this.pluginManager);
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
        if (this.config.debugMode) {
            this.startDebugMode();
        }
        else {
            this.startNormally();
        }
    }
    startNormally() {
        logger_js_1.default.log("Bot starting...");
        this.registerDefaultPrecommands();
        logger_js_1.default.setLevel(this.config.loggingLevel);
        this.memory.startAutoWrite();
        this.listenForClientReady();
    }
    startDebugMode() {
        logger_js_1.default.log("Bot starting in debug mode...");
        this.registerDebugPrecommands();
        logger_js_1.default.setLevel(4);
        this.listenForClientReady();
    }
    listenForClientReady() {
        if (this.client.isReady()) {
            this.onReady();
        }
        else {
            this.events.on("ready", this.onReady.bind(this));
        }
    }
    registerDefaultPrecommands() {
        const precommandStrs = this.config.precommands;
        const precommand = precommand_js_1.Precommand.create(this.hooks, precommandStrs);
        this.defaultPrecommand = precommand;
        this.precommandManager.register(precommand);
        this.hooks.attachDefaultPrecommand(precommand);
        this.registerDefaultCommands();
    }
    registerDefaultCommands() {
        this.defaultPrecommand.commandManager.register("restart", "bot", this.restart.bind(this), new commandOptions_js_1.default({
            help: new commandHelp_js_1.default({
                description: "Restarts the bot"
            }),
            requiredPermission: "BOT_ADMINISTRATOR",
            group: "Utils"
        }));
    }
    registerDebugPrecommands() {
        const precommand = precommand_js_1.Precommand.create(this.hooks, this.config.debugPrecommand, this.debugPrecommandCallback.bind(this));
        this.precommandManager.register(precommand);
    }
    debugPrecommandCallback(event) {
        try {
            const fs = require("fs");
            let str = util_1.inspect(eval(event.commandContent));
            str = ellipsisize_js_1.default(str.replace(/ {4}/g, "\t"), 1994);
            this.hooks.send(event.channelId, "```" + str + "```");
        }
        catch (err) {
            let str = err.stack;
            str = ellipsisize_js_1.default(str.replace(/ {4}/g, "\t"), 1994);
            this.hooks.send(event.channelId, "```" + str + "```");
        }
    }
    /**
     * Stops the bot (async)
     */
    stop() {
        this.pluginManager.unregisterAllPlugins();
        this.events.dispatch("stop", null);
        this.memory.writeOut();
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
}
exports.default = Bot;