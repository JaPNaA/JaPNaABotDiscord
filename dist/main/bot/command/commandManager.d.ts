import BotHooks from "../botHooks.js";
import CommandDispatcher from "./commandDispatcher.js";
import BotCommandHelp from "../../botcommandHelp.js";
import Precommand from "../../precommand.js";
import BotCommand from "../../botcommand.js";
import CommandRegistar from "./commandRegistar.js";
declare class CommandManager {
    register: CommandRegistar;
    dispatch: CommandDispatcher;
    precommands: Precommand[];
    commands: BotCommand[];
    commandGroups: Map<any, any>;
    plugins: never[];
    helpData: {
        [x: string]: BotCommandHelp;
    };
    constructor(botHooks: BotHooks);
    getHelp(command: string): BotCommandHelp;
    /**
     * checks if message starts with a precommand
     * @param {String} message
     * @returns {Precommand}
     */
    getFirstPrecommand(message: string): Precommand | null;
}
export default CommandManager;
