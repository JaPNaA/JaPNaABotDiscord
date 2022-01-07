import PrecommandDispatcher from "./precommandDispatcher";
import { Precommand, PrecommandWithCallback, PrecommandWithoutCallback } from "../precommand";
import PrecommandCallback from "../precommandCallback";
import PrecommandName from "../precommandName";
import Bot from "../../bot/bot";
declare class PrecommandManager {
    private bot;
    dispatch: PrecommandDispatcher;
    precommands: Precommand[];
    constructor(bot: Bot);
    register(precommand: Precommand): void;
    createAndRegister(name: string | string[], callback: PrecommandCallback): PrecommandWithCallback;
    createAndRegister(name: string | string[]): PrecommandWithoutCallback;
    /**
     * checks if message starts with a precommand
     */
    getFirstPrecommandName(message: string): PrecommandName | null;
}
export default PrecommandManager;
