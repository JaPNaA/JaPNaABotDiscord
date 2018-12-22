import BotHooks from "../../botHooks";
import { DiscordMessageEvent, DiscordCommandEvent } from "../../../events";
import PrecommandManager from "./precommandManager";

class PrecommandDispatcher {
    botHooks: BotHooks;
    manager: PrecommandManager;

    constructor(botHooks: BotHooks, manager: PrecommandManager) {
        this.botHooks = botHooks;
        this.manager = manager;
    }

    onMessage(message: DiscordMessageEvent): void {
        this.dispatchIfIsPrecommand(message);
    }

    dispatchIfIsPrecommand(messageEvent: DiscordMessageEvent): void {
        if (!messageEvent.precommand) return;

        const commandEvent = this._createDiscordCommandEvent(messageEvent);
        this.botHooks.events.dispatch("command", commandEvent);
        commandEvent.precommand.callback(commandEvent);
    }

    _createDiscordCommandEvent(messageEvent: DiscordMessageEvent): DiscordCommandEvent {
        const pre = messageEvent.precommand;
        if (!pre) throw new Error("Unknown error");

        const content = pre && messageEvent.message.slice(pre.precommandStr.length);
        return new DiscordCommandEvent(messageEvent, pre, content);
    }
}
export default PrecommandDispatcher;