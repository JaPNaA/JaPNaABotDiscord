import BotCommand from "./botcommand.js";
declare class BotCommandHelp {
    /** Description of what the command does */
    description: string;
    /** Contains all the available types of arguments */
    overloads: {
        [x: string]: string;
    }[] | undefined;
    /** Examples of the use of the command */
    examples: string[][] | undefined;
    /** The group that the command is in */
    group: string | undefined;
    /** Disallow the use of the command in Direct Messages? */
    noDM: boolean;
    /** The required permission to run the command */
    requiredPermission: string | undefined;
    /** The plugin where the command in from */
    fromPlugin: string | undefined;
    constructor(data: {
        /** Description of what the command does */
        description: string;
        /** All possible arguments of the command */
        overloads?: {
            [x: string]: string;
        }[];
        /** Examples of the command being used, [command, explanation] */
        examples?: string[][];
    });
    /**
     * Gathers some information about command
     */
    gatherInfoAboutCommand(command: BotCommand): void;
}
export default BotCommandHelp;
