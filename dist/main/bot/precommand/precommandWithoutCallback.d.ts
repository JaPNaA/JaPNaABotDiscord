import PrecommandCallback from "./precommandCallback";
import BotPermissions from "../botPermissions";
import CommandManager from "../command/manager/commandManager";
import BotHooks from "../botHooks";
import Precommand from "./precommand";
declare class PrecommandWithoutCallback extends Precommand {
    callback: PrecommandCallback;
    permissions: BotPermissions;
    commandManager: CommandManager;
    constructor(botHooks: BotHooks, name: string[]);
}
export default PrecommandWithoutCallback;
