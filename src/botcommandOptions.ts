/**
 * @typedef {import("./botcommandHelp.js")} BotCommandHelp
 */

class BotCommandOptions {
    requiredPermission: string | undefined;
    noDM: boolean | undefined;
    help: BotCommandHelp | undefined;
    group: string | undefined;
    /**
     * BotCommandOptions
     * @param options command triggering options
     */
    constructor(options: {
        /** The required permission to run command */
        requiredPermission?: string,
        /** Disallow the use of the command in Direct Messages? */
        noDM?: boolean,
        /** Help for the command, obtained via 'help' */
        help?: BotCommandHelp,
        /** The group the command belongs in, shows up in help */
        group?: string
    }) {
        this.requiredPermission = options.requiredPermission;
        this.noDM = options.noDM;
        this.help = options.help;
        this.group = options.group;
    }
}

export default BotCommandOptions;