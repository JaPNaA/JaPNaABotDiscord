import PrecommandCallback from "./precommandCallback.js";
import PrecommandName from "./precommandName.js";
import BotPermissions from "../bot/botPermissions.js";
import CommandManager from "../command/manager/commandManager.js";
import Bot from "../bot/bot.js";
declare abstract class Precommand {
    private bot;
    names: string[];
    abstract callback: PrecommandCallback;
    /**
     * @param name text which comes before a command
     * @param callback function to call to handle precommand
     */
    constructor(bot: Bot, name: string | string[]);
    static create(botHooks: Bot, name: string | string[]): PrecommandWithoutCallback;
    static create(botHooks: Bot, name: string | string[], callback: PrecommandCallback): PrecommandWithCallback;
    getNameInMessage(message: string): PrecommandName | null;
    toString(): string;
}
export { Precommand };
declare class PrecommandWithCallback extends Precommand {
    callback: PrecommandCallback;
    constructor(bot: Bot, name: string[], callback: PrecommandCallback);
}
export { PrecommandWithCallback };
declare class PrecommandWithoutCallback extends Precommand {
    callback: PrecommandCallback;
    permissions: BotPermissions;
    commandManager: CommandManager;
    constructor(bot: Bot, name: string[]);
}
export { PrecommandWithoutCallback };
