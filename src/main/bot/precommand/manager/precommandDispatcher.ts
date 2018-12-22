import BotHooks from "../../botHooks";
import { DiscordMessageEvent, DiscordCommandEvent } from "../../../events";
import PrecommandManager from "./precommandManager";
import Logger from "../../../logger";

class PrecommandDispatcher {
    botHooks: BotHooks;
    manager: PrecommandManager;

    constructor(botHooks: BotHooks, manager: PrecommandManager) {
        this.botHooks = botHooks;
        this.manager = manager;
    }

    onMessage(message: DiscordMessageEvent): void {
        Logger.log_message("<<", message.message);
        this.dispatchIfIsPrecommand(message);
    }

    dispatchIfIsPrecommand(messageEvent: DiscordMessageEvent): void {
        if (!messageEvent.precommandName) return;

        const commandEvent = this._createDiscordCommandEvent(messageEvent);
        this.botHooks.events.dispatch("command", commandEvent);
        commandEvent.precommandName.precommand.callback(commandEvent);
    }

    _createDiscordCommandEvent(messageEvent: DiscordMessageEvent): DiscordCommandEvent {
        const pre = messageEvent.precommandName;
        if (!pre) throw new Error("Unknown error");

        const content = pre && messageEvent.message.slice(pre.name.length);
        return new DiscordCommandEvent(messageEvent, pre, content);
    }
}
export default PrecommandDispatcher;