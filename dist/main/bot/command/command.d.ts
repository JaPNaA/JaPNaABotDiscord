import DiscordCommandEvent from "../events/discordCommandEvent";
import BotCommandCallback from "./commandCallback.js";
import Bot from "../bot/bot.js";
import { BotCommandHelp } from "./commandHelp.js";
import BotCommandOptions from "./commandOptions.js";
import { PermissionString } from "discord.js";
declare class BotCommand {
    private bot;
    /** Function to call when command is called */
    private func;
    /** Custom permission required to run command */
    requiredCustomPermission: string | undefined;
    /** Discord permission required to run command */
    requiredDiscordPermission: PermissionString | undefined;
    /** Is using this command in Direct Messages disallowed? */
    noDM: boolean;
    /** Help for the command */
    help: BotCommandHelp | undefined;
    /** Group the command belongs to */
    group: string | undefined;
    /** The string that triggers the command */
    commandName: string;
    /** Name of the plugin that registered this command */
    pluginName: string | undefined;
    private actionRunner;
    constructor(bot: Bot, commandName: string, pluginName: string, func: BotCommandCallback, options?: BotCommandOptions);
    /** Tries to run command, and sends an error message if fails */
    run(commandEvent: DiscordCommandEvent): Promise<void>;
    tryRunCommandGenerator(commandEvent: DiscordCommandEvent): AsyncGenerator<any, void, unknown>;
    isCommandEventMatch(commandEvent: DiscordCommandEvent): boolean;
    /**
     * Returns cleaned command content
     * @param dirtyContent dirty content to be cleaned
     * @returns cleaned command content
     */
    private _getCleanCommandContent;
    private testPermissions;
}
export default BotCommand;
