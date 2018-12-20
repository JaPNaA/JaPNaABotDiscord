/**
 * @typedef {import("../botHooks.js")} BotHooks
 * @typedef {import("../../botcommandOptions")} BotCommandOptions
 * @typedef {import("../../botcommandHelp.js")} BotCommandHelp
 * @typedef {import("../../events.js").DiscordMessageEvent} DiscordMessageEvent
 * @typedef {import("../../precommand").PrecommandCallback} PrecommandCallback
 * @typedef {import("./commandManager.js")} CommandManager
 * @typedef {import("../../botcommand.js").BotCommandCallback} BotCommandCallback
 */
declare const Precommand: any;
declare const BotCommand: any;
declare const createKey: any;
declare class CommandRegistar {
    /**
     * @param {BotHooks} botHooks
     */
    constructor(botHooks: any, manager: any);
    /**
     * Registers a precommand with callback
     * @param {String} precommandStr precommand to register
     * @param {PrecommandCallback} callback callback on precommand
     */
    precommand(precommandStr: any, callback: any): void;
    /**
     * register bot plugin
     * @param {*} plugin plugin
     */
    plugin(plugin: any): void;
    /**
     * Register a command
     * @param {String} triggerWord word that triggers command
     * @param {String} pluginName name of plugin
     * @param {BotCommandCallback} func function to call
     * @param {BotCommandOptions} [options] permissions required to call function
     */
    command(triggerWord: any, pluginName: any, func: any, options: any): void;
    /**
     * Apply config from bot.config to adjust command
     * @param {BotCommand} command command to apply config to
     */
    _applyConfigToCommand(command: any): void;
    /**
     * Adds a command to a group
     * @param {String | undefined} groupName name of group
     * @param {BotCommand} command command
     */
    _addCommandToGroup(groupName: any, command: any): void;
    /**
     * Add help information
     * @param {String} command name of command for help
     * @param {BotCommandHelp} data command help data
     */
    help(command: any, data: any): void;
    unregisterAllPlugins(): void;
}
