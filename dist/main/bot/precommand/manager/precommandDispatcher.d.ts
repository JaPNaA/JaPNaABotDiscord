import DiscordMessageEvent from "../../events/discordMessageEvent";
import PrecommandManager from "./precommandManager";
import DiscordCommandEvent from "../../events/discordCommandEvent";
import Bot from "../../bot/bot";
declare class PrecommandDispatcher {
    private bot;
    manager: PrecommandManager;
    constructor(bot: Bot, manager: PrecommandManager);
    onMessage(bot: Bot, message: DiscordMessageEvent): void;
    dispatchIfIsPrecommand(messageEvent: DiscordMessageEvent): void;
    _createDiscordCommandEvent(messageEvent: DiscordMessageEvent): DiscordCommandEvent;
}
export default PrecommandDispatcher;
