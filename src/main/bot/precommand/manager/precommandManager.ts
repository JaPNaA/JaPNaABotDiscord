import PrecommandDispatcher from "./precommandDispatcher";
import Precommand from "../precommand";
import BotHooks from "../../botHooks";

class PrecommandManager {
    botHooks: BotHooks;
    dispatch: PrecommandDispatcher;
    precommands: Precommand[];

    constructor(botHooks: BotHooks) {
        this.botHooks = botHooks;
        this.dispatch = new PrecommandDispatcher(botHooks, this);
        this.precommands = [];
    }

    register(precommand: Precommand) {
        this.precommands.push(precommand);
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

export default PrecommandManager;