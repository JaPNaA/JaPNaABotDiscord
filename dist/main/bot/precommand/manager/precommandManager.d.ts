import PrecommandDispatcher from "./precommandDispatcher";
import Precommand from "../precommand";
import BotHooks from "../../botHooks";
import PrecommandCallback from "../precommandCallback";
import PrecommandName from "../precommandName";
declare class PrecommandManager {
    botHooks: BotHooks;
    dispatch: PrecommandDispatcher;
    precommands: Precommand[];
    constructor(botHooks: BotHooks);
    register(precommand: Precommand): void;
    createAndRegister(name: string | string[], callback?: PrecommandCallback): Precommand;
    /**
     * checks if message starts with a precommand
     */
    getFirstPrecommandName(message: string): PrecommandName | null;
}
export default PrecommandManager;
