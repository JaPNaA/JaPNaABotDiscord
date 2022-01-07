import PrecommandDispatcher from "./precommandDispatcher";
import { Precommand, PrecommandWithCallback, PrecommandWithoutCallback } from "../precommand";
import PrecommandCallback from "../precommandCallback";
import PrecommandName from "../precommandName";
import Bot from "../../bot/bot";

class PrecommandManager {
    dispatch: PrecommandDispatcher;
    precommands: Precommand[];

    constructor(private bot: Bot) {
        this.dispatch = new PrecommandDispatcher(bot, this);
        this.precommands = [];
    }

    register(precommand: Precommand): void {
        this.precommands.push(precommand);
    }

    createAndRegister(name: string | string[], callback: PrecommandCallback): PrecommandWithCallback;
    createAndRegister(name: string | string[]): PrecommandWithoutCallback;

    createAndRegister(name: string | string[], callback?: PrecommandCallback): Precommand {
        let precommand: Precommand;
        if (callback) {
            precommand = Precommand.create(this.bot, name, callback);
        } else {
            precommand = Precommand.create(this.bot, name);
        }

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