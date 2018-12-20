"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const botcommand_js_1 = __importDefault(require("../../botcommand.js"));
const locationKeyCreator_js_1 = __importDefault(require("../locationKeyCreator.js"));
const precommand_js_1 = __importDefault(require("../../precommand.js"));
// TODO: Separate this class into registering and dispatching
class CommandRegistar {
    /**
     * @param {BotHooks} botHooks
     */
    constructor(botHooks, manager) {
        /** @type {BotHooks} */
        this.botHooks = botHooks;
        /** @type {CommandManager} */
        this.manager = manager;
    }
    precommand(precommandStr, callback) {
        let precommand = new precommand_js_1.default(precommandStr, callback);
        this.manager.precommands.push(precommand);
    }
    plugin(plugin) {
        plugin._start();
        this.manager.plugins.push(plugin);
    }
    command(triggerWord, pluginName, func, options) {
        let command = new botcommand_js_1.default(this.botHooks, triggerWord, pluginName, func, options);
        this.manager.commands.push(command);
        this.applyConfigToCommand(command);
        this.addCommandToGroup(command.group, command);
        this.help(command.commandName, command.help || null);
        if (command.help) // if help is available
            command.help.gatherInfoAboutCommand(command);
    }
    /** Add help information */
    help(command, data) {
        this.manager.helpData[command] = data;
    }
    unregisterAllPlugins() {
        for (let plugin of this.manager.plugins) {
            plugin._stop();
        }
        this.manager.commands.length = 0;
        this.manager.plugins.length = 0;
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
        if (this.manager.commandGroups.has(groupNameStr)) {
            this.manager.commandGroups.get(groupNameStr)
                .push(command);
        }
        else {
            this.manager.commandGroups.set(groupNameStr, [command]);
        }
    }
}
exports.default = CommandRegistar;
