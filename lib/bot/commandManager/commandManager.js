/**
 * @typedef {import("../botHooks.js")} BotHooks
 * @typedef {import("../../botcommandOptions")} BotCommandOptions
 * @typedef {import("../../botcommandHelp.js")} BotCommandHelp
 * @typedef {import("../../plugin.js")} Plugin
 */

const Precommand = require("../../precommand.js");
const BotCommand = require("../../botcommand.js");

class CommandManager {
    /**
     * @param {BotHooks} botHooks 
     */
    constructor(botHooks) {
        /** @type {BotHooks} */
        this.botHooks = botHooks;

        /**
         * @type {Precommand[]} Precommands that trigger the bot, with callbacks
         */
        this.registeredPrecommands = [];

        /**
         * @type {BotCommand[]} list of commands registered
         */
        this.registeredCommands = [];

        /**
         * @type {Map<string, BotCommand[]>} groups of commands
         */
        this.commandGroups = new Map();

        /**
         * @type {Plugin[]} list of plugins registered
         */
        this.registeredPlugins = [];

        /**
         * Data for help
         * @type {Object.<string, BotCommandHelp>}
         */
        this.helpData = {};
    }

    /**
     * Registers a precommand with callback
     * @param {String} precommandStr precommand to register
     * @param {Function} callback callback on precommand
     */
    registerPrecommand(precommandStr, callback) {
        let precommand = new Precommand(precommandStr, callback);
        this.registeredPrecommands.push(precommand);
    }

    /**
     * register bot plugin
     * @param {*} plugin plugin
     */
    registerPlugin(plugin) {
        plugin._start();

        this.registeredPlugins.push(plugin);
    }

    /**
     * Register a command
     * @param {String} triggerWord word that triggers command
     * @param {String} pluginName name of plugin
     * @param {Function} func function to call
     * @param {BotCommandOptions} [options] permissions required to call function
     */
    registerCommand(triggerWord, pluginName, func, options) {
        let command = new BotCommand(this.botHooks.bot, triggerWord, pluginName, func, options);

        this.registeredCommands.push(command);
        this.applyConfigToCommand(command);
        this.addCommandToGroup(command.group, command);
        this.registerHelp(command.commandName, command.help || null);

        if (command.help) // if help is available
            command.help.gatherInfoAboutCommand(command);
    }

    /**
     * Apply config from bot.config to adjust command
     * @param {BotCommand} command command to apply config to
     */
    applyConfigToCommand(command) {
        let pluginOverrides = this.botHooks.config.commandRequiredPermissionOverrides[
            this.botHooks.memory.createKey.plugin(command.pluginName)
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
    addCommandToGroup(groupName, command) {
        let groupNameStr = groupName || "Other";

        if (this.commandGroups.has(groupNameStr)) {
            this.commandGroups.get(groupNameStr)
                .push(command);
        } else {
            this.commandGroups.set(groupNameStr, [command]);
        }
    }

    /**
     * Add help information
     * @param {String} command name of command for help
     * @param {BotCommandHelp} data command help data
     */
    registerHelp(command, data) {
        this.helpData[command] = data;
    }

    /**
     * Get help information
     * @param {String} command name of command for help
     * @returns {BotCommandHelp} help infomation about command
     */
    getHelp(command) {
        return this.helpData[command];
    }


    /**
     * checks if message starts with a precommand
     * @param {String} message
     * @returns {Precommand}
     */
    getFirstPrecommand(message) {
        for (let precommand of this.registeredPrecommands) {
            let startsWithPrecommand = message.startsWith(precommand.precommandStr);

            if (startsWithPrecommand) {
                return precommand;
            }
        }

        return null;
    }

    unregisterAllPlugins() {
        for (let plugin of this.registeredPlugins) {
            plugin._stop();
        }

        this.registeredCommands.length = 0;
        this.registeredPlugins.length = 0;
    }
}

module.exports = CommandManager;