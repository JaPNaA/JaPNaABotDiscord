import { Message } from "discord.js";
import { ReplySoft } from "../main/bot/actions/actions";
import Bot from "../main/bot/bot/bot";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent";
import DiscordMessageEvent from "../main/bot/events/discordMessageEvent";
import BotPlugin from "../main/bot/plugin/plugin";
import wait from "../main/utils/async/wait";
import ellipsisize from "../main/utils/str/ellipsisize";
import mention from "../main/utils/str/mention";
import mentionChannel from "../main/utils/str/mentionChannel";
import removeFormattingChars from "../main/utils/str/removeFormattingChars";

class ActivityDashboard extends BotPlugin {
    private static DASHBOARD_UPDATE_COOLDOWN_TIME = 5000;
    private static ACTIVITY_HISTORY_MAX_LENGTH = 30;

    public userConfigSchema = {
        enabled: {
            type: "boolean",
            comment: "Is tracking for the server activity dashboard enabled here?",
            default: false
        },
        dashboardMessage: {
            type: "string",
            comment: "The ID (channelId-messageId format) of the message to use to record latest events. (Server-level config only)",
            default: ""
        }
    };

    private serverStates: Map<string, ServerState> = new Map();

    constructor(bot: Bot) {
        super(bot);
        this.pluginName = "activityDashboard";
    }

    private getServerStateMut(serverId: string): ServerState {
        const state = this.serverStates.get(serverId);
        if (state) {
            return state;
        } else {
            const newState = { activity: [] };
            this.serverStates.set(serverId, newState);
            return newState;
        }
    }

    private async messageHandler(event: DiscordMessageEvent) {
        const config = await this.config.getAllUserSettingsInChannel(event.channelId);
        if (!config.get("enabled")) { return; }
        const state = this.getServerStateMut(event.serverId);

        const activity = { timestamp: Math.round(event.createdTimestamp / 1000), userId: event.userId, message: event.message, channel: event.channelId };

        state.activity.push(activity);
        while (state.activity.length > ActivityDashboard.ACTIVITY_HISTORY_MAX_LENGTH) {
            state.activity.shift();
        }

        if (config.get("dashboardMessage")) {
            await this.requestDashboardUpdate(event.serverId);
        }
    }

    public *activityDashboard(event: DiscordCommandEvent) {
        const reply = new ReplySoft(this.generateMessage(event.serverId));
        yield reply;
        const message = reply.getMessage();
        const state = this.getServerStateMut(event.serverId);
        state.dashboardMessageCache = message;
        this.config.setInServer(event.serverId, "dashboardMessage", event.channelId + "-" + message.id);
    }

    private async requestDashboardUpdate(serverId: string) {
        const state = this.getServerStateMut(serverId);
        const dashboardMessageLocation = this.config.getInServer(serverId, "dashboardMessage") as string;
        if (!dashboardMessageLocation) { return; }

        const [dashboardMessageChannelId, dashboardMessageMessageId] = dashboardMessageLocation.split("-");
        if (state.onCooldown) {
            state.newChangesAfterCooldown = true;
            return;
        }
        state.onCooldown = true;
        state.newChangesAfterCooldown = false;

        if (!state.dashboardMessageCache || state.dashboardMessageCache.id !== dashboardMessageMessageId || state.dashboardMessageCache.channelId !== dashboardMessageChannelId) {
            state.dashboardMessageCache = await this.bot.client.getMessageFromChannel(dashboardMessageChannelId, dashboardMessageMessageId);
        }

        state.dashboardMessageCache.edit(this.generateMessage(serverId))
            .catch(err => { });

        wait(ActivityDashboard.DASHBOARD_UPDATE_COOLDOWN_TIME).then(() => {
            state.onCooldown = false;

            if (state.newChangesAfterCooldown) {
                return this.requestDashboardUpdate(serverId);
            }
        });
    }

    private generateMessage(serverId: string) {
        const activityLog = this.getServerStateMut(serverId).activity;
        const message = new ReversedMessageBuilder();

        message.addLine(`Last updated: <t:${Math.round(Date.now() / 1000)}:R>`);

        for (let i = activityLog.length - 1; i >= 0; i--) {
            const activity = activityLog[i];
            message.addLine(`<t:${activity.timestamp}:R> ${mention(activity.userId)} ${mentionChannel(activity.channel)}: ${ellipsisize(removeFormattingChars(activity.message), 40)}`);
            if (message.getCharCount() > 2000) {
                message.removeLastLine();
                break;
            }
        }

        return {
            content: message.getMessage(),
            allowedMentions: { users: [] }
        };
    }

    public _start(): void {
        this.messageHandler = this.messageHandler.bind(this);
        this.bot.events.message.addHandler(this.messageHandler);

        this._registerDefaultCommand("activity dashboard", this.activityDashboard, {
            help: {
                description: "Summons a live activity dashboard which lists recent activity on a server",
                examples: [
                    ["activity dashboard", "Summons an activity dashboard"]
                ]
            },
            requiredDiscordPermission: "ADMINISTRATOR"
        });
    }

    public _stop(): void | Promise<void> {
        this.bot.events.message.removeHandler(this.messageHandler);
    }

}

interface ServerState {
    activity: Activity[];
    dashboardMessageCache?: Message;
    onCooldown?: boolean;
    newChangesAfterCooldown?: boolean;
}

interface Activity {
    timestamp: number;
    userId: string;
    channel: string;
    message: string;
}

/**
 * Reversed Message Builder builds messages from the bottom, line-per-line.
 * 
 * Helps keep messages below a 2000 character limit.
 */
class ReversedMessageBuilder {
    private lines: string[] = [];
    private charCount: number = 0;

    public addLine(line: string) {
        if (this.lines.length > 0) { this.charCount += 1; } // newline character count
        this.lines.push(line);
        this.charCount += line.length;
    }

    public getCharCount(): number {
        return this.charCount;
    }

    public removeLastLine() {
        const line = this.lines.pop();
        if (line === undefined) { return; }
        this.charCount -= line.length;
        if (this.lines.length > 0) { this.charCount -= 1; } // newline character count
    }

    public getMessage() {
        this.lines.reverse();
        const str = this.lines.join("\n");
        this.lines.reverse();
        return str;
    }
}

export default ActivityDashboard;
