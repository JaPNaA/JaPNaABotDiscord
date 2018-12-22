import PrecommandCallback from "./precommandCallback.js";
import BotPermissions from "../botPermissions.js";
import CommandManager from "../command/manager/commandManager.js";
import BotHooks from "../botHooks.js";
import { toArray } from "../../utils.js";

class Precommand {
    botHooks: BotHooks;

    names: string[];
    callback: PrecommandCallback;

    permissions: BotPermissions;
    commandManager: CommandManager;

    /**
     * @param name text which comes before a command
     * @param callback function to call to handle precommand
     */
    constructor(botHooks: BotHooks, name: string | string[], callback?: PrecommandCallback) {
        this.botHooks = botHooks;
        this.permissions = new BotPermissions(botHooks);
        this.commandManager = new CommandManager(botHooks);
        
        this.names = toArray<string>(name);

        if (callback) {
            this.callback = callback;
        } else {
            this.callback = this.commandManager.dispatch.onMessage;
        }
    }

    public isInMessage(message: string): boolean {
        for (let name of this.names) {
            if (message.startsWith(name)) {
                return true;
            }
        }

        return false;
    }

    public toString(): string {
        return this.names[0];
    }
}

export default Precommand;