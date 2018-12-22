import BotCommand from "./command.js";

class BotCommandHelp {
    /** Description of what the command does */
    description: string;
    /** Contains all the available types of arguments */
    overloads: { [x: string]: string; }[] | undefined;
    /** Examples of the use of the command */
    examples: string[][] | undefined;
    /** The group that the command is in */
    group: string | undefined;
    /** Disallow the use of the command in Direct Messages? */
    noDM: boolean = false;
    /** The required permission to run the command */
    requiredPermission: string | undefined;
    /** The plugin where the command in from */
    fromPlugin: string | undefined;

    constructor(data: {
        /** Description of what the command does */
        description: string,
        /** All possible arguments of the command */
        overloads?: { [x: string]: string }[],
        /** Examples of the command being used, [command, explanation] */
        examples?: string[][]
    }) {
        this.description = data.description;
        this.overloads = data.overloads;
        this.examples = data.examples;
    }

    /**
     * Gathers some information about command
     */
    gatherInfoAboutCommand(command: BotCommand) {
        this.group = command.group;
        this.noDM = command.noDM;
        this.requiredPermission = command.requiredPermission;
        this.fromPlugin = command.pluginName;
    }
}

export default BotCommandHelp;