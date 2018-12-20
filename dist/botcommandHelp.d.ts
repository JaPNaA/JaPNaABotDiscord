/**
 * @typedef {import("./botcommand.js")} BotCommand
 */
declare class BotCommandHelp {
    /**
     * Bot Command Help constructor
     * @param {Object} data data of help
     * @param {String} data.description description of what the command does
     * @param {Object<string, string>[]} [data.overloads] possible arguments of the command
     * @param {String[][]} [data.examples] examples of the command being used [command, explanation]
     */
    constructor(data: any);
    /**
     * Gathers some information about command
     * @param {BotCommand} command
     */
    gatherInfoAboutCommand(command: any): void;
}
