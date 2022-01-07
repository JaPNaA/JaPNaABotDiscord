import CommandDispatcher from "./commandDispatcher.js";
import BotCommandHelp from "../commandHelp.js";
import BotCommand from "../command.js";
import BotCommandCallback from "../commandCallback.js";
import BotCommandOptions from "../commandOptions.js";
import createKey from "../../utils/locationKeyCreator.js";
import ObjectStrMap from "../../../types/objectStrMap";
import UnknownCommandHandler from "./unknownCommandHandler.js";
import Bot from "../../bot/bot.js";

class CommandManager {
    dispatch: CommandDispatcher;
    /** list of commands registered */
    commands: BotCommand[];
    /** called when an unknown command is called */
    unknownCommandHandler?: UnknownCommandHandler;
    /** groups of commands */
    commandGroups: Map<string | undefined, BotCommand[]>;
    /** Data for help */
    helpData: { [x: string]: BotCommandHelp | null | undefined };

    constructor(private bot: Bot) {

        this.dispatch = new CommandDispatcher(bot, this);
        this.commandGroups = new Map();

        // this.precommands = [];
        this.commands = [];
        // this.plugins = [];
        this.helpData = {};
    }

    getHelp(command: string): BotCommandHelp | null | undefined {
        return this.helpData[command];
    }

    register(triggerWord: string, pluginName: string, func: BotCommandCallback, options?: BotCommandOptions): void {
        let command: BotCommand = new BotCommand(this.bot, triggerWord, pluginName, func, options);

        this.commands.push(command);
        this.applyConfigToCommand(command);
        this.addCommandToGroup(command.group, command);
        this.registerHelp(command.commandName, command.help || null);

        if (command.help) { // if help is available
            command.help.gatherInfoAboutCommand(command);
        }
    }

    registerUnkownCommandHanlder(func: UnknownCommandHandler) {
        this.unknownCommandHandler = func;
    }

    /** Apply config from bot.config to adjust command */
    private applyConfigToCommand(command: BotCommand): void {
        if (!command.pluginName) { return; }

        let pluginOverrides: ObjectStrMap = this.bot.config.commandRequiredPermissionOverrides[
            createKey.plugin(command.pluginName)
        ];
        let overridingRequiredPermission: string =
            pluginOverrides && pluginOverrides[command.commandName];

        if (overridingRequiredPermission) {
            command.requiredPermission = overridingRequiredPermission;
        }
    }

    private addCommandToGroup(groupName: string | undefined, command: BotCommand): void {
        let groupNameStr: string = groupName || "Other";
        let commandGroup: BotCommand[] | undefined = this.commandGroups.get(groupNameStr);

        if (commandGroup) {
            commandGroup.push(command);
        } else {
            this.commandGroups.set(groupNameStr, [command]);
        }
    }

    private registerHelp(command: string, data: BotCommandHelp | null): void {
        this.helpData[command] = data;
    }
}

export default CommandManager;