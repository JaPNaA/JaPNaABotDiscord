import BotHooks from "../botHooks.js";

/**
 * @typedef {import("../botHooks.js")} BotHooks
 * @typedef {import("../../botcommandOptions")} BotCommandOptions
 * @typedef {import("../../botcommandHelp.js")} BotCommandHelp
 * @typedef {import("../../botcommand.js")} BotCommand
 * @typedef {import("../../precommand")} Precommand
 * @typedef {import("../../plugin.js")} Plugin
 */

const CommandRegistar = require("./commandRegistar.js");
const CommandDispatcher = require("./commandDispatcher.js");

class CommandManager {
    register: CommandRegistar;
    dispatch: CommandDispatcher;
    precommands: never[];
    commands: never[];
    commandGroups: Map<any, any>;
    plugins: never[];
    helpData: {};
    constructor(botHooks: BotHooks) {
        this.register = new CommandRegistar(botHooks, this);
        this.dispatch = new CommandDispatcher(botHooks, this);

        /**
         * @type {Precommand[]} Precommands that trigger the bot, with callbacks
         */
        this.precommands = [];

        /**
         * @type {BotCommand[]} list of commands registered
         */
        this.commands = [];

        /**
         * @type {Map<string, BotCommand[]>} groups of commands
         */
        this.commandGroups = new Map();

        /**
         * @type {Plugin[]} list of plugins registered
         */
        this.plugins = [];

        /**
         * Data for help
         * @type {Object.<string, BotCommandHelp>}
         */
        this.helpData = {};
    }

    /**
     * Gets help for command
     * @param {String} command command name
     */
    getHelp(command) {
        return this.helpData[command];
    }

    /**
     * checks if message starts with a precommand
     * @param {String} message
     * @returns {Precommand}
     */
    getFirstPrecommand(message) {
        for (let precommand of this.precommands) {
            let startsWithPrecommand = message.startsWith(precommand.precommandStr);

            if (startsWithPrecommand) {
                return precommand;
            }
        }

        return null;
    }
}

module.exports = CommandManager;