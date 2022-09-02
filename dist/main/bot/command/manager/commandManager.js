"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commandDispatcher_js_1 = __importDefault(require("./commandDispatcher.js"));
const commandHelp_js_1 = require("../commandHelp.js");
const command_js_1 = __importDefault(require("../command.js"));
const locationKeyCreator_js_1 = __importDefault(require("../../utils/locationKeyCreator.js"));
const removeFromArray_js_1 = __importDefault(require("../../../utils/removeFromArray.js"));
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
        this.commands = [];
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
    unregister(triggerWord) {
        const commandIndex = this.commands.findIndex(command => command.commandName === triggerWord);
        const command = this.commands[commandIndex];
        if (commandIndex < 0) {
            throw new Error(`Tried to unregister command '${triggerWord}' which was never registered`);
        }
        this.commands.splice(commandIndex, 1);
        this.removeCommandFromGroup(command.group, command);
        this.unregisterHelp(command);
    }
    registerUnkownCommandHanlder(func) {
        const fillerStr = "__unknownCommandHandler";
        this.unknownCommandHandler = new command_js_1.default(this.bot, fillerStr, fillerStr, func);
    }
    /** Apply config from bot.config to adjust command */
    applyConfigToCommand(command) {
        if (!command.pluginName) {
            return;
        }
        let pluginOverrides = this.bot.config.commandRequiredPermissionOverrides[locationKeyCreator_js_1.default.plugin(command.pluginName)];
        let overridingRequiredPermission = pluginOverrides && pluginOverrides[command.commandName];
        if (overridingRequiredPermission) {
            command.requiredCustomPermission = overridingRequiredPermission.custom;
            command.requiredDiscordPermission = overridingRequiredPermission.discord;
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
    removeCommandFromGroup(groupName, command) {
        let groupNameStr = groupName || "Other";
        let commandGroup = this.commandGroups.get(groupNameStr);
        if (!commandGroup) {
            throw new Error(`Could not find command group '${groupName}'`);
        }
        (0, removeFromArray_js_1.default)(commandGroup, command);
    }
    registerHelp(command, data) {
        this.helpData[command.commandName] = (0, commandHelp_js_1.getFullCommandHelp)(command, data);
    }
    unregisterHelp(command) {
        this.helpData[command.commandName] = undefined;
    }
}
exports.default = CommandManager;
