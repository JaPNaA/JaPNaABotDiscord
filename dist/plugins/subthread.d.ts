import { ReplySoft, ReplyThreadSoft, ReplyUnimportant, Send } from "../main/bot/actions/actions";
import Bot from "../main/bot/bot/bot";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent";
import BotPlugin from "../main/bot/plugin/plugin";
/**
 * Subthread plugin, a workaround to get threads inside other threads
 */
declare class Subthread extends BotPlugin {
    userConfigSchema: {
        subthreadChannel: {
            type: string;
            comment: string;
            default: string;
        };
        channelSelection: {
            type: string;
            comment: string;
            default: string;
        };
    };
    constructor(bot: Bot);
    subthread(event: DiscordCommandEvent): AsyncGenerator<Send, ReplySoft | ReplyUnimportant | ReplyThreadSoft, unknown>;
    private chooseSubthreadChannel;
    private canCreatePrivateThreadIn;
    private interactionHandler;
    _start(): void;
    _stop(): void;
}
export default Subthread;
