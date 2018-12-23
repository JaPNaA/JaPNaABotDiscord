import PrecommandCallback from "./precommandCallback.js";
import BotHooks from "../botHooks.js";
import PrecommandName from "./precommandName.js";
import BotPermissions from "../botPermissions.js";
import CommandManager from "../command/manager/commandManager.js";
declare abstract class Precommand {
    botHooks: BotHooks;
    names: string[];
    abstract callback: PrecommandCallback;
    /**
     * @param name text which comes before a command
     * @param callback function to call to handle precommand
     */
    constructor(botHooks: BotHooks, name: string | string[]);
    static create(botHooks: BotHooks, name: string | string[]): PrecommandWithoutCallback;
    static create(botHooks: BotHooks, name: string | string[], callback: PrecommandCallback): PrecommandWithCallback;
    getNameInMessage(message: string): PrecommandName | null;
    toString(): string;
}
export { Precommand };
declare class PrecommandWithCallback extends Precommand {
    callback: PrecommandCallback;
    constructor(botHooks: BotHooks, name: string[], callback: PrecommandCallback);
}
export { PrecommandWithCallback };
declare class PrecommandWithoutCallback extends Precommand {
    callback: PrecommandCallback;
    permissions: BotPermissions;
    commandManager: CommandManager;
    constructor(botHooks: BotHooks, name: string[]);
}
export { PrecommandWithoutCallback };
