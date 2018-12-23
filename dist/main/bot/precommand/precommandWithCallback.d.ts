import Precommand from "./precommand";
import PrecommandCallback from "./precommandCallback";
import BotHooks from "../botHooks";
declare class PrecommandWithCallback extends Precommand {
    callback: PrecommandCallback;
    constructor(botHooks: BotHooks, name: string[], callback: PrecommandCallback);
}
export default PrecommandWithCallback;
