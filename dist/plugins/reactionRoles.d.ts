import { DeleteMessageSoft, ReplySoft, ReplyUnimportant } from "../main/bot/actions/actions";
import Bot from "../main/bot/bot/bot";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent";
import BotPlugin from "../main/bot/plugin/plugin";
export default class ReactionRoles extends BotPlugin {
    private messageReactionRoleMap;
    constructor(bot: Bot);
    createReactionRoll(event: DiscordCommandEvent): AsyncGenerator<ReplySoft | DeleteMessageSoft, ReplyUnimportant | "Please specify a roll via mention." | undefined, unknown>;
    _start(): void;
    private getMemberFromChannel;
    private isSameEmoji;
    private writeMemory;
    _stop(): void;
}
