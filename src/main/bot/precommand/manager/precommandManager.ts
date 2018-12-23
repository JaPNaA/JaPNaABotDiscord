import PrecommandDispatcher from "./precommandDispatcher";
import Precommand from "../precommand";
import BotHooks from "../../botHooks";
import PrecommandCallback from "../precommandCallback";
import PrecommandName from "../precommandName";

class PrecommandManager {
    botHooks: BotHooks;
    dispatch: PrecommandDispatcher;
    precommands: Precommand[];

    constructor(botHooks: BotHooks) {
        this.botHooks = botHooks;
        this.dispatch = new PrecommandDispatcher(botHooks, this);
        this.precommands = [];
    }

    register(precommand: Precommand): void {
        this.precommands.push(precommand);
    }

    createAndRegister(name: string | string[], callback?: PrecommandCallback): Precommand {
        const precommand: Precommand = new Precommand(this.botHooks, name, callback);
        this.precommands.push(precommand);
        return precommand;
    }

    /**
     * checks if message starts with a precommand
     */
    getFirstPrecommandName(message: string): PrecommandName | null {
        for (let precommand of this.precommands) {
            let precommandNameInMessage: PrecommandName | null = precommand.getNameInMessage(message);

            if (precommandNameInMessage) {
                return precommandNameInMessage;
            }
        }

        return null;
    }
}

export default PrecommandManager;