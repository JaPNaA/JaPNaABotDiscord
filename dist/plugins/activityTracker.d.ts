import BotPlugin from "../main/bot/plugin/plugin.js";
import Bot from "../main/bot/bot/bot";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent.js";
import { ReplyUnimportant } from "../main/bot/actions/actions.js";
/**
 * Tracks the activity and status messages of members in the server
 */
declare class ActivityTracker extends BotPlugin {
    private statusHistory;
    userConfigSchema: {
        enabled: {
            type: string;
            comment: string;
            default: boolean;
        };
    };
    constructor(bot: Bot);
    private refreshAllUsers;
    private precenceUpdate;
    private recordPresence;
    activities_history(event: DiscordCommandEvent): AsyncGenerator<never, string | ReplyUnimportant, unknown>;
    _start(): void;
    _stop(): void;
}
export default ActivityTracker;
