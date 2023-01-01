import { ReplySoft, ReplyThreadSoft, ReplyUnimportant, Send } from "../main/bot/actions/actions";
import Bot from "../main/bot/bot/bot";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent";
import BotPlugin from "../main/bot/plugin/plugin";
/**
 * Subthread plugin, a workaround to get threads inside other threads
 */
declare class Subthread extends BotPlugin {
    constructor(bot: Bot);
    subthread(event: DiscordCommandEvent): AsyncGenerator<Send, ReplyUnimportant | ReplyThreadSoft | ReplySoft, unknown>;
    private interactionHandler;
    _start(): void;
    _stop(): void;
}
export default Subthread;
