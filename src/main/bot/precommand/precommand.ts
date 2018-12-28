import PrecommandCallback from "./precommandCallback.js";
import BotHooks from "../botHooks.js";
import { toArray } from "../../utils.js";
import PrecommandName from "./precommandName.js";
import BotPermissions from "../botPermissions.js";
import CommandManager from "../command/manager/commandManager.js";

abstract class Precommand {
    botHooks: BotHooks;
    names: string[];
    
    abstract callback: PrecommandCallback;

    /**
     * @param name text which comes before a command
     * @param callback function to call to handle precommand
     */
    constructor(botHooks: BotHooks, name: string | string[]) {
        this.botHooks = botHooks;
        this.names = toArray<string>(name);
    }

    static create(botHooks: BotHooks, name: string | string[]): PrecommandWithoutCallback;
    static create(botHooks: BotHooks, name: string | string[], 
        callback: PrecommandCallback): PrecommandWithCallback;

    static create(botHooks: BotHooks, name: string | string[], 
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

    constructor(botHooks: BotHooks, name: string[], callback: PrecommandCallback) {
        super(botHooks, name);
        this.names = toArray<string>(name);

        this.callback = callback;
    }
}

export { PrecommandWithCallback };

class PrecommandWithoutCallback extends Precommand {
    callback: PrecommandCallback;

    permissions: BotPermissions;
    commandManager: CommandManager;

    constructor(botHooks: BotHooks, name: string[]) {
        super(botHooks, name);

        this.permissions = new BotPermissions(botHooks);
        this.commandManager = new CommandManager(botHooks);

        this.names = name;

        let commandDispatcher = this.commandManager.dispatch;
        this.callback = commandDispatcher.onMessage.bind(commandDispatcher);
    }
}

export { PrecommandWithoutCallback };
