"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BotCommandHelp {
    /** Description of what the command does */
    description;
    /** Contains all the available types of arguments */
    overloads;
    /** Examples of the use of the command */
    examples;
    /** The group that the command is in */
    group;
    /** Disallow the use of the command in Direct Messages? */
    noDM = false;
    /** The required permission to run the command */
    requiredPermission;
    /** The plugin where the command in from */
    fromPlugin;
    constructor(data) {
        this.description = data.description;
        this.overloads = data.overloads;
        this.examples = data.examples;
    }
    /**
     * Gathers some information about command
     */
    gatherInfoAboutCommand(command) {
        this.group = command.group;
        this.noDM = command.noDM;
        this.requiredPermission = command.requiredPermission;
        this.fromPlugin = command.pluginName;
    }
}
exports.default = BotCommandHelp;
