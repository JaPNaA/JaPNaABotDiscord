import BotPlugin from "../main/bot/plugin/plugin.js";
import Bot from "../main/bot/bot/bot";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent.js";
import { ReplyUnimportant } from "../main/bot/actions/actions.js";
import { Activity, Guild, Presence } from "discord.js";
import toArray from "../main/utils/toArray.js";
import toOne from "../main/utils/toOne.js";
import getSnowflakeNum from "../main/utils/getSnowflakeNum.js";
import ellipsisize from "../main/utils/str/ellipsisize.js";
import { JSONObject, JSONType } from "../main/types/jsonObject.js";

/**
 * Tracks the activity and status messages of members in the server
 */
class ActivityTracker extends BotPlugin {
    private statusHistory = new StatusHistory();

    public userConfigSchema = {
        enabled: {
            type: "boolean",
            comment: "Must be enabled on the server level to take effect. Track statuses and activities of users on the server?",
            default: false
        }
    };

    constructor(bot: Bot) {
        super(bot);
        this.pluginName = "activityTracker";

        const memoryHistory = this.bot.memory.get(this.pluginName, "statusHistory");
        if (memoryHistory) {
            this.statusHistory.import(memoryHistory);
        }
    }

    private async refreshAllUsers() {
        const visitedUsers = new Set<string>();
        const servers = await this.bot.client.client.guilds.fetch();

        for (const [serverId, partialServer] of servers) {
            if (!this.config.getInServer(serverId, "enabled")) { continue; }
            const server = await partialServer.fetch();

            const members = await server.members.fetch();

            for (const [memberId, member] of members) {
                if (visitedUsers.has(member.user.id)) { continue; }
                visitedUsers.add(member.user.id);

                if (member.partial) { await member.fetch(); }
                if (member.presence) {
                    this.statusHistory.setRefreshing();
                    this.recordPresence(member.presence);
                    this.statusHistory.unsetRefreshing();
                }
            }
        }
    }

    private precenceUpdate(prev: Presence | null, now: Presence) {
        if (!now.guild) { return; } // must be in a server
        const isEnabled = this.config.getInServer(now.guild.id, "enabled");
        if (!isEnabled) { return; }

        this.recordPresence(now);
    }

    private recordPresence(presence: Presence) {
        this.statusHistory.recordStatusIfChanged(presence.userId, presence.status);
        // activity is automatically NONE if offline, so don't record it
        if (!(["offline", "invisible"].includes(presence.status))) {
            this.statusHistory.recordActivityIfChanged(presence.userId, toOne(presence.activities));
        }

        if (this.statusHistory.isDirty()) {
            this.bot.memory.markDirty();
        }
    }

    public async *activities_history(event: DiscordCommandEvent) {
        const userId = getSnowflakeNum(event.arguments) || event.userId;

        // check if user is in server
        const member = await this.bot.client.getMemberFromServer(userId, event.serverId);
        if (!member) { return new ReplyUnimportant("Cannot check a user outside this server"); }

        const history = this.statusHistory.getUserStatusHistory(userId);
        const message = [];

        message.push("**Statuses**");
        for (const status of history.statuses.slice(-20)) {
            message.push(new Date(status.startTime).toLocaleTimeString() + (status.refresh ? "(?)" : "") + ": " + status.type);
        }

        message.push("**Activities**");
        for (const activity of history.activities.slice(-20)) {
            message.push(new Date(activity.startTime).toLocaleString() + (activity.refresh ? "(?)" : "") + ": " + activity.type + " " + activity.name);
        }

        return ellipsisize(message.join("\n"), 2000);
    }

    _start(): void {
        this.bot.client.client.on("presenceUpdate", (prev, now) => {
            this.precenceUpdate(prev, now);
        });
        this.bot.events.ready.addHandler(() => this.refreshAllUsers());
        this.bot.events.beforeMemoryWrite.addHandler(() => {
            this.bot.memory.write(this.pluginName, "statusHistory", this.statusHistory.export());
            this.statusHistory.markClean();
        });
        this._registerDefaultCommand("activities history", this.activities_history);

        this._registerDefaultCommand("clear activities history", async function* (this: ActivityTracker) {
            this.statusHistory.clear();
        }, { requiredCustomPermission: "BOT_ADMINISTRATOR" });
    }

    _stop(): void {
        // do nothing
    }
}

class StatusHistory {
    private users: Map<string, UserStatusHistory> = new Map();
    private changed = false;
    private refreshing = false;

    public import(obj: any) {
        const keys = Object.keys(obj);
        for (const key of keys) {
            const userStatusHistory = new UserStatusHistory();
            userStatusHistory.import(obj[key]);
            this.users.set(key, userStatusHistory);
        }
    }

    public getUserStatusHistory(userId: string) {
        return this.users.get(userId) || new UserStatusHistory();
    }

    public setRefreshing() { this.refreshing = true; }
    public unsetRefreshing() { this.refreshing = false; }

    public recordStatusIfChanged(userId: string, rawStatus: string | undefined) {
        let status = rawStatus || "offline";
        const userStatusHistory = this.getOrCreateUserStatusHistory(userId);
        const latestStatus = userStatusHistory.getLatestStatus();
        if (latestStatus && latestStatus.type === status) { return; } // not changed

        userStatusHistory.recordStatus(status, this.refreshing);
        this.changed = true;
    }

    public recordActivityIfChanged(userId: string, activity: Activity | undefined) {
        const userStatusHistory = this.getOrCreateUserStatusHistory(userId);
        const latestActivity = userStatusHistory.getLatestActivity();
        const activityName = activity ?
            (
                activity.type === "CUSTOM" ?
                    (activity.emoji?.name ? activity.emoji.name + " " : "") + activity.state || ""
                    : activity.name
            ) : "";
        const activityType = activity ? activity.type : "NONE";
        if (latestActivity && latestActivity.type === activityType && latestActivity.name === activityName) { return; } // not changed

        userStatusHistory.recordActivity(activityType, activityName, this.refreshing);
        this.changed = true;
    }

    public export() {
        const map = new Map<string, any>();
        for (const [key, value] of this.users) {
            map.set(key, value.export());
        }
        return Object.fromEntries(map);
    }

    public clear() {
        this.users.clear();
        this.changed = true;
    }

    public isDirty() {
        return this.changed;
    }

    public markClean() {
        this.changed = false;
    }

    private getOrCreateUserStatusHistory(userId: string) {
        const userStatusHistory = this.users.get(userId);
        if (userStatusHistory) { return userStatusHistory; }

        const newUserStatusHistory = new UserStatusHistory();
        this.users.set(userId, newUserStatusHistory);
        return newUserStatusHistory;
    }
}

class UserStatusHistory {
    public statuses: StatusHistoryRecord[] = [];
    public activities: ActivityHistoryRecord[] = [];

    public import(obj: JSONObject) {
        this.statuses = (obj.statuses ? toArray(obj.statuses) : []) as any as StatusHistoryRecord[];
        this.activities = (obj.activities ? toArray(obj.activities) : []) as any as ActivityHistoryRecord[];
    }

    public recordStatus(newStatus: string, isRefresh: boolean) {
        const record: StatusHistoryRecord = {
            type: newStatus,
            startTime: Date.now()
        };
        if (isRefresh) {
            record.refresh = 1;
        }
        this.statuses.push(record);
    }

    public recordActivity(type: string, name: string, isRefresh: boolean) {
        const record: ActivityHistoryRecord = {
            type: type,
            name: name,
            startTime: Date.now()
        };
        if (isRefresh) {
            record.refresh = 1;
        }
        this.activities.push(record);
    }

    public getLatestStatus() {
        return this.statuses[this.statuses.length - 1];
    }

    public getLatestActivity() {
        return this.activities[this.activities.length - 1];
    }

    public export(): JSONObject {
        return {
            "statuses": this.statuses as any as JSONType[],
            "activities": this.activities as any as JSONType[]
        };
    }
}

interface StatusHistoryRecord {
    type: string;
    startTime: number;
    /**
     * If exists and is 1, refresh indicates the record was added when the bot started (instead of by an event).
     * The startTime may be inaccurate in this case
     */
    refresh?: 1;
}

interface ActivityHistoryRecord {
    type: string;
    name: string;
    startTime: number;
    /**
     * If exists and is 1, refresh indicates the record was added when the bot started (instead of by an event).
     * The startTime may be inaccurate in this case
     */
    refresh?: 1;
}

export default ActivityTracker;