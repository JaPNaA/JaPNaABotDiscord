import BotHooks from "../../botHooks";
import { DiscordMessageEvent, DiscordCommandEvent } from "../../../events";
import PrecommandManager from "./precommandManager";
declare class PrecommandDispatcher {
    botHooks: BotHooks;
    manager: PrecommandManager;
    constructor(botHooks: BotHooks, manager: PrecommandManager);
    onMessage(botHooks: BotHooks, message: DiscordMessageEvent): void;
    dispatchIfIsPrecommand(messageEvent: DiscordMessageEvent): void;
    _createDiscordCommandEvent(messageEvent: DiscordMessageEvent): DiscordCommandEvent;
}
export default PrecommandDispatcher;
