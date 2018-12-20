/**
 * @typedef {import("../botHooks.js")} BotHooks
 * @typedef {import("../../botcommandOptions")} BotCommandOptions
 * @typedef {import("../../botcommandHelp.js")} BotCommandHelp
 * @typedef {import("../../events.js").DiscordMessageEvent} DiscordMessageEvent
 * @typedef {import("../../precommand").PrecommandCallback} PrecommandCallback
 * @typedef {import("./commandManager.js")} CommandManager
 * @typedef {import("../../botcommand.js").BotCommandCallback} BotCommandCallback
 */

const Precommand = require("../../precommand.js");
const BotCommand = require("../../botcommand.js"); 
const createKey = require("../locationKeyCreator.js");

// TODO: Separate this class into registering and dispatching
class CommandRegistar {
    botHooks: any;
    manager: any;
    /**
     * @param {BotHooks} botHooks 
     */
    constructor(botHooks: BotHooks, manager: CommandManager) {
        /** @type {BotHooks} */
        this.botHooks = botHooks;

        /** @type {CommandManager} */
        this.manager = manager;
    }

    /**
     * Registers a precommand with callback
     * @param {String} precommandStr precommand to register
     * @param {PrecommandCallback} callback callback on precommand
     */
    precommand(precommandStr, callback) {
        let precommand = new Precommand(precommandStr, callback);
        this.manager.precommands.push(precommand);
    }

    /**
     * register bot plugin
     * @param {*} plugin plugin
     */
    plugin(plugin) {
        plugin._start();

        this.manager.plugins.push(plugin);
    }

    /**
     * Register a command
     * @param {String} triggerWord word that triggers command
     * @param {String} pluginName name of plugin
     * @param {BotCommandCallback} func function to call
     * @param {BotCommandOptions} [options] permissions required to call function
     */
    command(triggerWord, pluginName, func, options) {
        let command = new BotCommand(this.botHooks, triggerWord, pluginName, func, options);

        this.manager.commands.push(command);
        this._applyConfigToCommand(command);
        this._addCommandToGroup(command.group, command);
        this.help(command.commandName, command.help || null);

        if (command.help) // if help is available
            command.help.gatherInfoAboutCommand(command);
    }

    /**
     * Apply config from bot.config to adjust command
     * @param {BotCommand} command command to apply config to
     */
    _applyConfigToCommand(command) {
        let pluginOverrides = this.botHooks.config.commandRequiredPermissionOverrides[
            createKey.plugin(command.pluginName)
        ];
        let overridingRequiredPermission =
            pluginOverrides && pluginOverrides[command.commandName];

        if (overridingRequiredPermission) {
            command.requiredPermission = overridingRequiredPermission;
        }
    }

    /**
     * Adds a command to a group
     * @param {String | undefined} groupName name of group
     * @param {BotCommand} command command
     */
    _addCommandToGroup(groupName, command) {
        let groupNameStr = groupName || "Other";

        if (this.manager.commandGroups.has(groupNameStr)) {
            this.manager.commandGroups.get(groupNameStr)
                .push(command);
        } else {
            this.manager.commandGroups.set(groupNameStr, [command]);
        }
    }

    /**
     * Add help information
     * @param {String} command name of command for help
     * @param {BotCommandHelp} data command help data
     */
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
}

module.exports = CommandRegistar;