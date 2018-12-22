import BotHooks from "../botHooks.js";
import CommandManager from "./commandManager.js";
import BotPlugin from "../../plugin.js";
import BotCommandOptions from "../../commandOptions.js";
import BotCommand from "../../command.js";
import BotCommandHelp from "../../commandHelp.js";
import createKey from "../locationKeyCreator.js";
import Precommand from "../precommand/precommand.js";
import PrecommandCallback from "../precommand/precommandCallback.js";
import BotCommandCallback from "../../commandCallback.js";

class CommandRegistar {
    botHooks: BotHooks;
    manager: CommandManager;
    
    constructor(botHooks: BotHooks, manager: CommandManager) {
        this.botHooks = botHooks;
        this.manager = manager;
    }

    precommand(precommandStr: string, callback: PrecommandCallback) {
        let precommand = new Precommand(precommandStr, callback);
        this.manager.precommands.push(precommand);
    }

    plugin(plugin: BotPlugin) {
        plugin._start();

        this.manager.plugins.push(plugin);
    }

    command(triggerWord: string, pluginName: string, func: BotCommandCallback, options?: BotCommandOptions) {
        let command = new BotCommand(this.botHooks, triggerWord, pluginName, func, options);

        this.manager.commands.push(command);
        this.applyConfigToCommand(command);
        this.addCommandToGroup(command.group, command);
        this.help(command.commandName, command.help || null);

        if (command.help) // if help is available
            command.help.gatherInfoAboutCommand(command);
    }

    /** Add help information */
    help(command: string, data: BotCommandHelp | null) {
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
    private applyConfigToCommand(command: BotCommand) {
        if (!command.pluginName) return;

        let pluginOverrides = this.botHooks.config.commandRequiredPermissionOverrides[
            createKey.plugin(command.pluginName)
        ];
        let overridingRequiredPermission =
            pluginOverrides && pluginOverrides[command.commandName];

        if (overridingRequiredPermission) {
            command.requiredPermission = overridingRequiredPermission;
        }
    }

    private addCommandToGroup(groupName: string | undefined, command: BotCommand) {
        let groupNameStr = groupName || "Other";
        let commandGroup = this.manager.commandGroups.get(groupNameStr);

        if (commandGroup) {
            commandGroup.push(command);
        } else {
            this.manager.commandGroups.set(groupNameStr, [command]);
        }
    }
}

export default CommandRegistar;