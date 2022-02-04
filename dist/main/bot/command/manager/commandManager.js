"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commandDispatcher_js_1 = __importDefault(require("./commandDispatcher.js"));
const commandHelp_js_1 = require("../commandHelp.js");
const command_js_1 = __importDefault(require("../command.js"));
const locationKeyCreator_js_1 = __importDefault(require("../../utils/locationKeyCreator.js"));
class CommandManager {
    bot;
    dispatch;
    /** list of commands registered */
    commands;
    /** called when an unknown command is called */
    unknownCommandHandler;
    /** groups of commands */
    commandGroups;
    /** Data for help */
    helpData;
    constructor(bot) {
        this.bot = bot;
        this.dispatch = new commandDispatcher_js_1.default(bot, this);
        this.commandGroups = new Map();
        // this.precommands = [];
        this.commands = [];
        // this.plugins = [];
        this.helpData = {};
    }
    getHelp(command) {
        return this.helpData[command];
    }
    register(triggerWord, pluginName, func, options) {
        let command = new command_js_1.default(this.bot, triggerWord, pluginName, func, options);
        this.commands.push(command);
        this.applyConfigToCommand(command);
        this.addCommandToGroup(command.group, command);
        this.registerHelp(command, (0, commandHelp_js_1.getFullCommandHelp)(command, command.help));
    }
    registerUnkownCommandHanlder(func) {
        this.unknownCommandHandler = func;
    }
    /** Apply config from bot.config to adjust command */
    applyConfigToCommand(command) {
        if (!command.pluginName) {
            return;
        }
        let pluginOverrides = this.bot.config.commandRequiredPermissionOverrides[locationKeyCreator_js_1.default.plugin(command.pluginName)];
        let overridingRequiredPermission = pluginOverrides && pluginOverrides[command.commandName];
        if (overridingRequiredPermission) {
            command.requiredPermission = overridingRequiredPermission;
        }
    }
    addCommandToGroup(groupName, command) {
        let groupNameStr = groupName || "Other";
        let commandGroup = this.commandGroups.get(groupNameStr);
        if (commandGroup) {
            commandGroup.push(command);
        }
        else {
            this.commandGroups.set(groupNameStr, [command]);
        }
    }
    registerHelp(command, data) {
        this.helpData[command.commandName] = (0, commandHelp_js_1.getFullCommandHelp)(command, data);
    }
}
exports.default = CommandManager;
