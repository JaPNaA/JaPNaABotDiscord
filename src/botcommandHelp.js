/**
 * @typedef {import("./botcommand.js")} BotCommand
 */

class BotCommandHelp {
    /**
     * Bot Command Help constructor
     * @param {Object} data data of help
     * @param {String} data.description description of what the command does
     * @param {Object<string, string>[]} [data.overloads] possible arguments of the command
     * @param {String[][]} [data.examples] examples of the command being used [command, explanation]
     */
    constructor(data) {
        /** 
         * Description of what the command does
         * @type {String}
         */
        this.description = data.description;
        
        /**
         * Contains all available types of arguments
         * @type {Object<string, string>[]}
         */
        this.overloads = data.overloads;

        /**
         * Examples of the use of the command
         * @type {String[][]}
         */
        this.examples = data.examples;

        /**
         * The group that the command is in
         * @type {String | undefined}
         */
        this.group = undefined;

        /**
         * Can the command be ran in Direct Messages?
         * @type {Boolean}
         */
        this.noDM = false;

        /**
         * The required permission to run this command
         * @type {String | undefined}
         */
        this.requiredPermission = undefined;

        /**
         * The plugin where command came from
         */
        this.fromPlugin = undefined;
    }

    /**
     * Gathers some information about command
     * @param {BotCommand} command
     */
    gatherInfoAboutCommand(command) {
        this.group = command.group;
        this.noDM = command.noDM;
        this.requiredPermission = command.requiredPermission;
        this.fromPlugin = command.pluginName;
    }
}

module.exports = BotCommandHelp;