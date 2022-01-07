import PrecommandCallback from "./precommandCallback.js";
import toArray from "../../utils/toArray";
import PrecommandName from "./precommandName.js";
import BotPermissions from "../bot/botPermissions.js";
import CommandManager from "../command/manager/commandManager.js";
import Bot from "../bot/bot.js";

abstract class Precommand {
    names: string[];
    
    abstract callback: PrecommandCallback;

    /**
     * @param name text which comes before a command
     * @param callback function to call to handle precommand
     */
    constructor(private bot: Bot, name: string | string[]) {
        this.names = toArray<string>(name);
    }

    static create(botHooks: Bot, name: string | string[]): PrecommandWithoutCallback;
    static create(botHooks: Bot, name: string | string[], 
        callback: PrecommandCallback): PrecommandWithCallback;

    static create(botHooks: Bot, name: string | string[], 
        callback?: PrecommandCallback): Precommand {
        let nameArr: string[] = toArray<string>(name);

        if (callback) {
            return new PrecommandWithCallback(botHooks, nameArr, callback);
        } else {
            return new PrecommandWithoutCallback(botHooks, nameArr);
        }
    }

    public getNameInMessage(message: string): PrecommandName | null {
        for (let i: number = 0; i < this.names.length; i++) {
            const name: string = this.names[i];

            if (message.startsWith(name)) {
                return new PrecommandName(this, i);
            }
        }

        return null;
    }

    public toString(): string {
        return this.names[0];
    }
}

export { Precommand };

class PrecommandWithCallback extends Precommand {
    callback: PrecommandCallback;

    constructor(bot: Bot, name: string[], callback: PrecommandCallback) {
        super(bot, name);
        this.names = toArray<string>(name);

        this.callback = callback;
    }
}

export { PrecommandWithCallback };

class PrecommandWithoutCallback extends Precommand {
    callback: PrecommandCallback;

    permissions: BotPermissions;
    commandManager: CommandManager;

    constructor(bot: Bot, name: string[]) {
        super(bot, name);

        this.permissions = new BotPermissions(bot);
        this.commandManager = new CommandManager(bot);

        this.names = name;

        let commandDispatcher = this.commandManager.dispatch;
        this.callback = commandDispatcher.onMessage.bind(commandDispatcher);
    }
}

export { PrecommandWithoutCallback };
