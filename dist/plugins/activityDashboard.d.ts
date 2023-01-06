import { ReplySoft } from "../main/bot/actions/actions";
import Bot from "../main/bot/bot/bot";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent";
import BotPlugin from "../main/bot/plugin/plugin";
declare class ActivityDashboard extends BotPlugin {
    static readonly DASHBOARD_UPDATE_COOLDOWN_TIME = 5000;
    static readonly ACTIVITY_HISTORY_MAX_LENGTH = 50;
    static readonly EMBED_FIELD_VALUE_MAX_LENGTH = 1024;
    static readonly EMBED_FIELDS_MAX_LENGTH = 25;
    static readonly LINES_PER_CHANNEL_MAX = 5;
    userConfigSchema: {
        enabled: {
            type: string;
            comment: string;
            default: boolean;
        };
        dashboardMessage: {
            type: string;
            comment: string;
            default: string;
        };
    };
    private serverStates;
    constructor(bot: Bot);
    private getServerStateMut;
    private messageHandler;
    private messageEditHandler;
    private reactHandler;
    private secondTimestamp;
    private maybeRecordAndUpdate;
    activityDashboard(event: DiscordCommandEvent): AsyncGenerator<ReplySoft, void, unknown>;
    private requestDashboardUpdate;
    private generateMessage;
    private serializeActivityHistory;
    _start(): void;
    _stop(): void | Promise<void>;
}
export default ActivityDashboard;
