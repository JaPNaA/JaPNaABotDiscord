import PrecommandDispatcher from "./precommandDispatcher";
import { Precommand, PrecommandWithCallback, PrecommandWithoutCallback } from "../precommand";
import BotHooks from "../../bot/botHooks";
import PrecommandCallback from "../precommandCallback";
import PrecommandName from "../precommandName";
declare class PrecommandManager {
    botHooks: BotHooks;
    dispatch: PrecommandDispatcher;
    precommands: Precommand[];
    constructor(botHooks: BotHooks);
    register(precommand: Precommand): void;
    createAndRegister(name: string | string[], callback: PrecommandCallback): PrecommandWithCallback;
    createAndRegister(name: string | string[]): PrecommandWithoutCallback;
    /**
     * checks if message starts with a precommand
     */
    getFirstPrecommandName(message: string): PrecommandName | null;
}
export default PrecommandManager;
