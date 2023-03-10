import BotCommand from "./command.js";

export interface BotCommandHelp {
    /** Description of what the command does */
    description: string;
    /** Contains all the available types of arguments */
    overloads?: { [x: string]: string; }[];
    /** Examples of the use of the command */
    examples?: string[][];
}

export interface BotCommandHelpFull extends BotCommandHelp {
    /** The group that the command is in */
    group?: string;
    /** Disallow the use of the command in Direct Messages? */
    noDM: boolean;
    /** The required discord permission to run the command */
    requiredDiscordPermission?: string;
    /** The required custom permission to run the command */
    requiredCustomPermission?: string;
    /** The plugin where the command in from */
    fromPlugin?: string;
}

/**
 * Gathers some information about command
 */
export function getFullCommandHelp(command: BotCommand, help?: BotCommandHelp | null): BotCommandHelpFull {
    return {
        ...help || { description: "" },
        group: command.group,
        noDM: command.noDM || false,
        requiredDiscordPermission: command.requiredDiscordPermission,
        requiredCustomPermission: command.requiredCustomPermission,
        fromPlugin: command.pluginName
    }
}
