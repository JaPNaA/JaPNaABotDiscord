import { ReplySoft } from "../main/bot/actions/actions";
import Bot from "../main/bot/bot/bot";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent";
import BotPlugin from "../main/bot/plugin/plugin";
declare class ActivityDashboard extends BotPlugin {
    private static DASHBOARD_UPDATE_COOLDOWN_TIME;
    private static ACTIVITY_HISTORY_MAX_LENGTH;
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
    activityDashboard(event: DiscordCommandEvent): Generator<ReplySoft, void, unknown>;
    private requestDashboardUpdate;
    private generateMessage;
    _start(): void;
    _stop(): void | Promise<void>;
}
export default ActivityDashboard;
