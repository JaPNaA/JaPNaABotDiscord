import PrecommandCallback from "./precommandCallback.js";
import BotPermissions from "../botPermissions.js";
import CommandManager from "../command/manager/commandManager.js";
import BotHooks from "../botHooks.js";

class Precommand {
    botHooks: BotHooks;

    precommandStr: string;
    callback: PrecommandCallback;

    permissions: BotPermissions;
    commandManager: CommandManager;

    /**
     * @param precommand text which comes before a command
     * @param callback function to call to handle precommand
     */
    constructor(botHooks: BotHooks, precommand: string, callback: PrecommandCallback) {
        this.botHooks = botHooks;
        
        this.precommandStr = precommand;
        this.callback = callback;

        this.permissions = new BotPermissions(botHooks);
        this.commandManager = new CommandManager(botHooks);
    }

    public toString(): string {
        return this.precommandStr;
    }
}

export default Precommand;