"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_js_1 = __importDefault(require("../main/bot/plugin/plugin.js"));
const actions_js_1 = require("../main/bot/actions/actions.js");
const discord_js_1 = require("discord.js");
const toArray_js_1 = __importDefault(require("../main/utils/toArray.js"));
const toOne_js_1 = __importDefault(require("../main/utils/toOne.js"));
const getSnowflakeNum_js_1 = __importDefault(require("../main/utils/getSnowflakeNum.js"));
const ellipsisize_js_1 = __importDefault(require("../main/utils/str/ellipsisize.js"));
/**
 * Tracks the activity and status messages of members in the server
 */
class ActivityTracker extends plugin_js_1.default {
    statusHistory = new StatusHistory();
    userConfigSchema = {
        enabled: {
            type: "boolean",
            comment: "Must be enabled on the server level to take effect. Track statuses and activities of users on the server?",
            default: false
        }
    };
    constructor(bot) {
        super(bot);
        this.pluginName = "activityTracker";
        const memoryHistory = this.bot.memory.get(this.pluginName, "statusHistory");
        if (memoryHistory) {
            this.statusHistory.import(memoryHistory);
        }
    }
    async refreshAllUsers() {
        const visitedUsers = new Set();
        const servers = await this.bot.client.client.guilds.fetch();
        for (const [serverId, partialServer] of servers) {
            if (!this.config.getInServer(serverId, "enabled")) {
                continue;
            }
            const server = await partialServer.fetch();
            const members = await server.members.fetch();
            for (const [memberId, member] of members) {
                if (visitedUsers.has(member.user.id)) {
                    continue;
                }
                visitedUsers.add(member.user.id);
                if (member.partial) {
                    await member.fetch();
                }
                if (member.presence) {
                    this.statusHistory.setRefreshing();
                    this.recordPresence(member.presence);
                    this.statusHistory.unsetRefreshing();
                }
            }
        }
    }
    precenceUpdate(prev, now) {
        if (!now.guild) {
            return;
        } // must be in a server
        const isEnabled = this.config.getInServer(now.guild.id, "enabled");
        if (!isEnabled) {
            return;
        }
        this.recordPresence(now);
    }
    recordPresence(presence) {
        this.statusHistory.recordStatusIfChanged(presence.userId, presence.status);
        // activity is automatically NONE if offline, so don't record it
        if (!(["offline", "invisible"].includes(presence.status))) {
            this.statusHistory.recordActivityIfChanged(presence.userId, (0, toOne_js_1.default)(presence.activities));
        }
        if (this.statusHistory.isDirty()) {
            this.bot.memory.markDirty();
        }
    }
    async *activities_history(event) {
        const userId = (0, getSnowflakeNum_js_1.default)(event.arguments) || event.userId;
        // check if user is in server
        const member = await this.bot.client.getMemberFromServer(userId, event.serverId);
        if (!member) {
            return new actions_js_1.ReplyUnimportant("Cannot check a user outside this server");
        }
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
        return (0, ellipsisize_js_1.default)(message.join("\n"), 2000);
    }
    _start() {
        this.bot.client.client.on("presenceUpdate", (prev, now) => {
            this.precenceUpdate(prev, now);
        });
        this.bot.events.ready.addHandler(() => this.refreshAllUsers());
        this.bot.events.beforeMemoryWrite.addHandler(() => {
            this.bot.memory.write(this.pluginName, "statusHistory", this.statusHistory.export());
            this.statusHistory.markClean();
        });
        this._registerDefaultCommand("activities history", this.activities_history);
        this._registerDefaultCommand("clear activities history", async function* () {
            this.statusHistory.clear();
        }, { requiredCustomPermission: "BOT_ADMINISTRATOR" });
    }
    _stop() {
        // do nothing
    }
}
class StatusHistory {
    users = new Map();
    changed = false;
    refreshing = false;
    import(obj) {
        const keys = Object.keys(obj);
        for (const key of keys) {
            const userStatusHistory = new UserStatusHistory();
            userStatusHistory.import(obj[key]);
            this.users.set(key, userStatusHistory);
        }
    }
    getUserStatusHistory(userId) {
        return this.users.get(userId) || new UserStatusHistory();
    }
    setRefreshing() { this.refreshing = true; }
    unsetRefreshing() { this.refreshing = false; }
    recordStatusIfChanged(userId, rawStatus) {
        let status = rawStatus || "offline";
        const userStatusHistory = this.getOrCreateUserStatusHistory(userId);
        const latestStatus = userStatusHistory.getLatestStatus();
        if (latestStatus && latestStatus.type === status) {
            return;
        } // not changed
        userStatusHistory.recordStatus(status, this.refreshing);
        this.changed = true;
    }
    recordActivityIfChanged(userId, activity) {
        const userStatusHistory = this.getOrCreateUserStatusHistory(userId);
        const latestActivity = userStatusHistory.getLatestActivity();
        const activityName = activity ?
            (activity.type === discord_js_1.ActivityType.Custom ?
                (activity.emoji?.name ? activity.emoji.name + " " : "") + activity.state || ""
                : activity.name) : "";
        const activityType = activity ? activity.type : -1;
        if (latestActivity && latestActivity.type === activityType && latestActivity.name === activityName) {
            return;
        } // not changed
        userStatusHistory.recordActivity(activityType, activityName, this.refreshing);
        this.changed = true;
    }
    export() {
        const map = new Map();
        for (const [key, value] of this.users) {
            map.set(key, value.export());
        }
        return Object.fromEntries(map);
    }
    clear() {
        this.users.clear();
        this.changed = true;
    }
    isDirty() {
        return this.changed;
    }
    markClean() {
        this.changed = false;
    }
    getOrCreateUserStatusHistory(userId) {
        const userStatusHistory = this.users.get(userId);
        if (userStatusHistory) {
            return userStatusHistory;
        }
        const newUserStatusHistory = new UserStatusHistory();
        this.users.set(userId, newUserStatusHistory);
        return newUserStatusHistory;
    }
}
class UserStatusHistory {
    statuses = [];
    activities = [];
    import(obj) {
        this.statuses = (obj.statuses ? (0, toArray_js_1.default)(obj.statuses) : []);
        this.activities = (obj.activities ? (0, toArray_js_1.default)(obj.activities) : []);
    }
    recordStatus(newStatus, isRefresh) {
        const record = {
            type: newStatus,
            startTime: Date.now()
        };
        if (isRefresh) {
            record.refresh = 1;
        }
        this.statuses.push(record);
    }
    recordActivity(type, name, isRefresh) {
        const record = {
            type: type,
            name: name,
            startTime: Date.now()
        };
        if (isRefresh) {
            record.refresh = 1;
        }
        this.activities.push(record);
    }
    getLatestStatus() {
        return this.statuses[this.statuses.length - 1];
    }
    getLatestActivity() {
        return this.activities[this.activities.length - 1];
    }
    export() {
        return {
            "statuses": this.statuses,
            "activities": this.activities
        };
    }
}
exports.default = ActivityTracker;
