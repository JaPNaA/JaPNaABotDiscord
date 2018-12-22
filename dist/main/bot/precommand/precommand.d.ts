import PrecommandCallback from "./precommandCallback.js";
import BotPermissions from "../botPermissions.js";
import CommandManager from "../command/manager/commandManager.js";
import BotHooks from "../botHooks.js";
import PrecommandName from "./precommandName.js";
declare class Precommand {
    botHooks: BotHooks;
    names: string[];
    callback: PrecommandCallback;
    permissions: BotPermissions;
    commandManager: CommandManager;
    /**
     * @param name text which comes before a command
     * @param callback function to call to handle precommand
     */
    constructor(botHooks: BotHooks, name: string | string[], callback?: PrecommandCallback);
    getNameInMessage(message: string): PrecommandName | null;
    toString(): string;
}
export default Precommand;
