"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commandDispatcher_js_1 = __importDefault(require("./commandDispatcher.js"));
const command_js_1 = __importDefault(require("../command.js"));
const locationKeyCreator_js_1 = __importDefault(require("../../locationKeyCreator.js"));
class CommandManager {
    constructor(botHooks) {
        this.botHooks = botHooks;
        this.dispatch = new commandDispatcher_js_1.default(botHooks, this);
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
        let command = new command_js_1.default(this.botHooks, triggerWord, pluginName, func, options);
        this.commands.push(command);
        this.applyConfigToCommand(command);
        this.addCommandToGroup(command.group, command);
        this.registerHelp(command.commandName, command.help || null);
        if (command.help) // if help is available
            command.help.gatherInfoAboutCommand(command);
    }
    /** Apply config from bot.config to adjust command */
    applyConfigToCommand(command) {
        if (!command.pluginName)
            return;
        let pluginOverrides = this.botHooks.config.commandRequiredPermissionOverrides[locationKeyCreator_js_1.default.plugin(command.pluginName)];
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
        this.helpData[command] = data;
    }
}
exports.default = CommandManager;
