import BotHooks from "../../bot/botHooks";
import DiscordMessageEvent from "../../types/discordMessageEvent";
import PrecommandManager from "./precommandManager";
import Logger from "../../../utils/logger";
import PrecommandName from "../precommandName";
import DiscordCommandEvent from "../../types/discordCommandEvent";

class PrecommandDispatcher {
    botHooks: BotHooks;
    manager: PrecommandManager;

    constructor(botHooks: BotHooks, manager: PrecommandManager) {
        this.botHooks = botHooks;
        this.manager = manager;

        this.botHooks.events.on("message", this.onMessage.bind(this));
    }

    onMessage(botHooks: BotHooks, message: DiscordMessageEvent): void {
        Logger.log_message("<<", message.message);
        this.dispatchIfIsPrecommand(message);
    }

    dispatchIfIsPrecommand(messageEvent: DiscordMessageEvent): void {
        if (!messageEvent.precommandName) { return; }

        const commandEvent: DiscordCommandEvent = this._createDiscordCommandEvent(messageEvent);
        this.botHooks.events.dispatch("command", commandEvent);
        commandEvent.precommandName.precommand.callback(commandEvent);
    }

    _createDiscordCommandEvent(messageEvent: DiscordMessageEvent): DiscordCommandEvent {
        const pre: PrecommandName | null = messageEvent.precommandName;
        if (!pre) { throw new Error("Unknown error"); }

        const content: string = pre && messageEvent.message.slice(pre.name.length);
        return new DiscordCommandEvent({
            messageEvent: messageEvent,
            pre: pre,
            content: content
        });
    }
}
export default PrecommandDispatcher;