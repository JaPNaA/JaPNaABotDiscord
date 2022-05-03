import CommandDispatcher from "./commandDispatcher.js";
import { BotCommandHelp, BotCommandHelpFull, getFullCommandHelp } from "../commandHelp.js";
import BotCommand from "../command.js";
import BotCommandCallback from "../commandCallback.js";
import BotCommandOptions from "../commandOptions.js";
import createKey from "../../utils/locationKeyCreator.js";
import ObjectStrMap from "../../../types/objectStrMap";
import UnknownCommandHandler from "./unknownCommandHandler.js";
import Bot from "../../bot/bot.js";
import removeFromArray from "../../../utils/removeFromArray.js";

class CommandManager {
    dispatch: CommandDispatcher;
    /** list of commands registered */
    commands: BotCommand[];
    /** called when an unknown command is called */
    unknownCommandHandler?: UnknownCommandHandler;
    /** groups of commands */
    commandGroups: Map<string | undefined, BotCommand[]>;
    /** Data for help */
    helpData: { [x: string]: BotCommandHelpFull | null | undefined };

    constructor(private bot: Bot) {

        this.dispatch = new CommandDispatcher(bot, this);
        this.commandGroups = new Map();

        this.commands = [];
        this.helpData = {};
    }

    getHelp(command: string): BotCommandHelpFull | null | undefined {
        return this.helpData[command];
    }

    register(triggerWord: string, pluginName: string, func: BotCommandCallback, options?: BotCommandOptions): void {
        let command: BotCommand = new BotCommand(this.bot, triggerWord, pluginName, func, options);

        this.commands.push(command);
        this.applyConfigToCommand(command);
        this.addCommandToGroup(command.group, command);
        this.registerHelp(command, getFullCommandHelp(command, command.help));
    }

    unregister(triggerWord: string) {
        const commandIndex = this.commands.findIndex(command => command.commandName === triggerWord);
        const command = this.commands[commandIndex];
        if (commandIndex < 0) {
            throw new Error(`Tried to unregister command '${triggerWord}' which was never registered`);
        }
        this.commands.splice(commandIndex, 1);

        this.removeCommandFromGroup(command.group, command);
        this.unregisterHelp(command);
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

    private removeCommandFromGroup(groupName: string | undefined, command: BotCommand) {
        let groupNameStr: string = groupName || "Other";
        let commandGroup: BotCommand[] | undefined = this.commandGroups.get(groupNameStr);
        if (!commandGroup) {
            throw new Error(`Could not find command group '${groupName}'`);
        }
        removeFromArray(commandGroup, command);
    }

    private registerHelp(command: BotCommand, data: BotCommandHelp | null): void {
        this.helpData[command.commandName] = getFullCommandHelp(command, data);
    }

    private unregisterHelp(command: BotCommand): void {
        this.helpData[command.commandName] = undefined;
    }
}

export default CommandManager;