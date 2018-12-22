import BotHooks from "../botHooks.js";
import CommandDispatcher from "./commandDispatcher.js";
import BotCommandHelp from "../../commandHelp.js";
import Precommand from "../precommand/precommand.js";
import BotCommand from "../../command.js";
import CommandRegistar from "./commandRegistar.js";
import BotPlugin from "../../plugin.js";

class CommandManager {
    register: CommandRegistar;
    dispatch: CommandDispatcher;
    /** Precommands that trigger the bot, with callbacks */
    precommands: Precommand[];
    /** list of commands registered */
    commands: BotCommand[];
    /** groups of commands */
    commandGroups: Map<string | undefined, BotCommand[]>;
    /** list of plugins registered*/
    plugins: BotPlugin[];
    /** Data for help */
    helpData: { [x: string]: BotCommandHelp | null | undefined };
    constructor(botHooks: BotHooks) {
        this.register = new CommandRegistar(botHooks, this);
        this.dispatch = new CommandDispatcher(botHooks, this);
        this.commandGroups = new Map();

        this.precommands = [];
        this.commands = [];
        this.plugins = [];
        this.helpData = {};
    }

    getHelp(command: string): BotCommandHelp | null | undefined {
        return this.helpData[command];
    }

    /**
     * checks if message starts with a precommand
     */
    getFirstPrecommand(message: string): Precommand | null {
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