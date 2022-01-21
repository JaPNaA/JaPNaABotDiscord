"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const precommand_1 = require("../precommand/precommand");
const pluginConfig_1 = __importDefault(require("./pluginConfig"));
class BotPlugin {
    bot;
    pluginName;
    config;
    constructor(bot) {
        this.bot = bot;
        this.pluginName = this.constructor.name.toLowerCase();
        this.config = new pluginConfig_1.default(this, bot);
    }
    /** Registers a command handler */
    _registerDefaultCommand(name, callback, options) {
        this.bot.defaultPrecommand.commandManager.register(name, this.pluginName, callback.bind(this), options);
    }
    _registerCommand(precommandOrCommandManager, name, callback, options) {
        let commandManager;
        if (precommandOrCommandManager instanceof precommand_1.PrecommandWithoutCallback) {
            commandManager = precommandOrCommandManager.commandManager;
        }
        else {
            commandManager = precommandOrCommandManager;
        }
        commandManager.register(name, this.pluginName, callback.bind(this), options);
    }
    _registerUnknownCommandHandler(precommandOrCommandManager, func) {
        let commandManager;
        if (precommandOrCommandManager instanceof precommand_1.PrecommandWithoutCallback) {
            commandManager = precommandOrCommandManager.commandManager;
        }
        else {
            commandManager = precommandOrCommandManager;
        }
        commandManager.registerUnkownCommandHanlder(func.bind(this));
    }
    /** Adds a handler function to an event */
    _registerEventHandler(name, callback) {
        this.bot.events.on(name, callback.bind(this));
    }
    /** Adds a handler function to a precommand */
    _registerPrecommand(precommand, callback) {
        const precommandManager = this.bot.precommandManager;
        if (callback) {
            return precommandManager.createAndRegister(precommand, callback.bind(this));
        }
        else {
            return precommandManager.createAndRegister(precommand);
        }
    }
}
exports.default = BotPlugin;
