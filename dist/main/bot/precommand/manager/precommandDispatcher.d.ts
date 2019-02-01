import BotHooks from "../../bot/botHooks";
import DiscordMessageEvent from "../../types/discordMessageEvent";
import PrecommandManager from "./precommandManager";
import DiscordCommandEvent from "../../types/discordCommandEvent";
declare class PrecommandDispatcher {
    botHooks: BotHooks;
    manager: PrecommandManager;
    constructor(botHooks: BotHooks, manager: PrecommandManager);
    onMessage(botHooks: BotHooks, message: DiscordMessageEvent): void;
    dispatchIfIsPrecommand(messageEvent: DiscordMessageEvent): void;
    _createDiscordCommandEvent(messageEvent: DiscordMessageEvent): DiscordCommandEvent;
}
export default PrecommandDispatcher;
