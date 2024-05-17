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
        usePrivateThreads: {
            type: string;
            comment: string;
            default: boolean;
        };
    };
    constructor(bot: Bot);
    subthread(event: DiscordCommandEvent): AsyncGenerator<Send, ReplyUnimportant | ReplyThreadSoft | ReplySoft, unknown>;
    private chooseSubthreadChannel;
    private canCreateThreadIn;
    private interactionHandler;
    _start(): void;
    _stop(): void;
}
export default Subthread;
