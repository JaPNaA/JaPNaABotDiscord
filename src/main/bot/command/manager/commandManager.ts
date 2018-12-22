import BotHooks from "../../botHooks.js";
import CommandDispatcher from "./commandDispatcher.js";
import BotCommandHelp from "../commandHelp.js";
import Precommand from "../../precommand/precommand.js";
import BotCommand from "../command.js";
import BotPlugin from "../../plugin/plugin.js";
import BotCommandCallback from "../commandCallback.js";
import BotCommandOptions from "../commandOptions.js";
import createKey from "../../locationKeyCreator.js";

class CommandManager {
    botHooks: BotHooks;
    
    dispatch: CommandDispatcher;
    /** list of commands registered */
    commands: BotCommand[];
    /** groups of commands */
    commandGroups: Map<string | undefined, BotCommand[]>;
    /** Data for help */
    helpData: { [x: string]: BotCommandHelp | null | undefined };
    
    constructor(botHooks: BotHooks) {
        this.botHooks = botHooks;

        this.dispatch = new CommandDispatcher(botHooks, this);
        this.commandGroups = new Map();

        // this.precommands = [];
        this.commands = [];
        // this.plugins = [];
        this.helpData = {};
    }

    getHelp(command: string): BotCommandHelp | null | undefined {
        return this.helpData[command];
    }

    register(triggerWord: string, pluginName: string, func: BotCommandCallback, options?: BotCommandOptions) {
        let command = new BotCommand(this.botHooks, triggerWord, pluginName, func, options);

        this.commands.push(command);
        this.applyConfigToCommand(command);
        this.addCommandToGroup(command.group, command);
        this.registerHelp(command.commandName, command.help || null);

        if (command.help) // if help is available
            command.help.gatherInfoAboutCommand(command);
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
        let commandGroup = this.commandGroups.get(groupNameStr);

        if (commandGroup) {
            commandGroup.push(command);
        } else {
            this.commandGroups.set(groupNameStr, [command]);
        }
    }

    private registerHelp(command: string, data: BotCommandHelp | null) {
        this.helpData[command] = data;
    }
}

export default CommandManager;