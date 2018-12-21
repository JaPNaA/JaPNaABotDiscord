import BotHooks from "../botHooks.js";
import CommandDispatcher from "./commandDispatcher.js";
import BotCommandHelp from "../../botcommandHelp.js";
import Precommand from "../../precommand.js";
import BotCommand from "../../botcommand.js";
import CommandRegistar from "./commandRegistar.js";

class CommandManager {
    register: CommandRegistar;
    dispatch: CommandDispatcher;
    precommands: Precommand[];
    commands: BotCommand[];
    commandGroups: Map<any, any>;
    plugins: never[];
    helpData: {[x: string]: BotCommandHelp};
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

    getHelp(command: string): BotCommandHelp {
        return this.helpData[command];
    }

    /**
     * checks if message starts with a precommand
     * @param {String} message
     * @returns {Precommand}
     */
    getFirstPrecommand(message: string) {
        for (let precommand of this.precommands) {
            let startsWithPrecommand = message.startsWith(precommand.precommandStr);

            if (startsWithPrecommand) {
                return precommand;
            }
        }

        return null;
    }
}

export default CommandManager;