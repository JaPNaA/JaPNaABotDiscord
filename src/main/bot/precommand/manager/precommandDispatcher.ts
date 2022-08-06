import DiscordMessageEvent from "../../events/discordMessageEvent";
import PrecommandManager from "./precommandManager";
import Logger from "../../../utils/logger";
import PrecommandName from "../precommandName";
import DiscordCommandEvent from "../../events/discordCommandEvent";
import Bot from "../../bot/bot";

class PrecommandDispatcher {
    manager: PrecommandManager;

    constructor(private bot: Bot, manager: PrecommandManager) {
        this.manager = manager;

        this.bot.events.message.addHandler(this.onMessage.bind(this));
    }

    onMessage(message: DiscordMessageEvent): void {
        Logger.log_message("<<", message.message);
        this.dispatchIfIsPrecommand(message);
    }

    dispatchIfIsPrecommand(messageEvent: DiscordMessageEvent): void {
        if (!messageEvent.precommandName) { return; }

        const commandEvent: DiscordCommandEvent = this._createDiscordCommandEvent(messageEvent);
        this.bot.events.command.dispatch(commandEvent);
        commandEvent.precommandName.precommand.callback(commandEvent);
    }

    _createDiscordCommandEvent(messageEvent: DiscordMessageEvent): DiscordCommandEvent {
        const pre: PrecommandName | null = messageEvent.precommandName;
        if (!pre) { throw new Error("Unknown error"); }

        const content: string = pre && messageEvent.message.slice(pre.name.length);
        return {
            ...messageEvent,
            precommandName: pre,
            commandContent: content,
            arguments: ""
        };
    }
}
export default PrecommandDispatcher;