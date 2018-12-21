"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BotCommandHelp {
    /**
     * Bot Command Help constructor
     * @param {Object} data data of help
     */
    constructor(data) {
        /** Disallow the use of the command in Direct Messages? */
        this.noDM = false;
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
