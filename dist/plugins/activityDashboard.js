"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const actions_1 = require("../main/bot/actions/actions");
const plugin_1 = __importDefault(require("../main/bot/plugin/plugin"));
const wait_1 = __importDefault(require("../main/utils/async/wait"));
const logger_1 = __importDefault(require("../main/utils/logger"));
const removeFromArray_1 = __importDefault(require("../main/utils/removeFromArray"));
const ellipsisize_1 = __importDefault(require("../main/utils/str/ellipsisize"));
const mention_1 = __importDefault(require("../main/utils/str/mention"));
const mentionChannel_1 = __importDefault(require("../main/utils/str/mentionChannel"));
const removeFormattingChars_1 = __importDefault(require("../main/utils/str/removeFormattingChars"));
const unmentionify_1 = require("../main/utils/str/unmentionify");
class ActivityDashboard extends plugin_1.default {
    static DASHBOARD_UPDATE_COOLDOWN_TIME = 5000;
    static ACTIVITY_HISTORY_MAX_LENGTH = 50;
    static EMBED_MAX_TOTAL_CHARS = 6000;
    static EMBED_FIELD_VALUE_MAX_LENGTH = 1024;
    static EMBED_FIELDS_MAX_LENGTH = 25;
    static LINES_PER_CHANNEL_MAX = 5;
    userConfigSchema = {
        enabled: {
            type: "boolean",
            comment: "Is tracking for the server activity dashboard enabled here?",
            default: false
        },
        dashboardMessage: {
            type: "string",
            comment: "The ID (channelId-messageId format) of the message to use to record latest events. (Server-level config only)",
            default: ""
        },
        liveChannelName: {
            type: "boolean",
            comment: "Update the channel name to indicate recent activity? (ex. '#activity-12m-ago'). The channel with the activity dashboard message's name will be updated. (Server-level config only)",
            default: false
        }
    };
    serverStates = new Map();
    constructor(bot) {
        super(bot);
        this.pluginName = "activityDashboard";
        const memoryHistory = this.bot.memory.get(this.pluginName, "activityHistory");
        if (memoryHistory) {
            const keys = Object.keys(memoryHistory);
            for (const key of keys) {
                const state = this.getServerStateMut(key);
                state.activity.deserialize(memoryHistory[key]);
            }
        }
    }
    getServerStateMut(serverId) {
        const state = this.serverStates.get(serverId);
        if (state) {
            return state;
        }
        else {
            const newState = { activity: new Activity() };
            this.serverStates.set(serverId, newState);
            return newState;
        }
    }
    async messageHandler(event) {
        return this.maybeRecordAndUpdate(event.serverId, {
            timestamp: this.secondTimestamp(event.createdTimestamp),
            userId: event.userId,
            type: "sent",
            message: event.message,
            messageId: event.messageId,
            channelId: event.channelId
        });
    }
    async messageEditHandler(oldMessage, newMessage) {
        // change not relevant
        if (oldMessage.content === newMessage.content && oldMessage.attachments.size === newMessage.attachments.size) {
            return;
        }
        // probably not a message edit
        if (newMessage.partial) {
            return;
        }
        return this.maybeRecordAndUpdate(newMessage.guildId || "", {
            timestamp: this.secondTimestamp(newMessage.editedTimestamp || Date.now()),
            userId: newMessage.author?.id || "",
            type: "edited",
            message: newMessage.content || "",
            messageId: newMessage.id,
            channelId: newMessage.channelId
        });
    }
    async reactHandler(reaction, user) {
        return this.maybeRecordAndUpdate(reaction.message.guildId || "", {
            timestamp: this.secondTimestamp(Date.now()),
            userId: user.id,
            type: "reacted",
            message: reaction.emoji.id ? `<${reaction.emoji.animated ? 'a' : ''}:${reaction.emoji.name}:${reaction.emoji.id}>` : reaction.emoji.name || "",
            messageId: reaction.message.id,
            channelId: reaction.message.channelId
        });
    }
    secondTimestamp(millisecondTimestamp) {
        return Math.round(millisecondTimestamp / 1000);
    }
    async maybeRecordAndUpdate(serverId, record) {
        if (record.userId === this.bot.client.id) {
            return;
        }
        const config = await this.config.getAllUserSettingsInChannel(record.channelId);
        if (!config.get("enabled")) {
            return;
        }
        const state = this.getServerStateMut(serverId);
        state.activity.add(record);
        if (config.get("dashboardMessage")) {
            await this.requestDashboardUpdate(serverId);
        }
    }
    async *activityDashboard(event) {
        const reply = new actions_1.ReplySoft(await this.generateMessage(event, event.serverId));
        yield reply;
        const message = reply.getMessage();
        const state = this.getServerStateMut(event.serverId);
        state.dashboardMessageCache = message;
        this.config.setInServer(event.serverId, "dashboardMessage", event.channelId + "-" + message.id);
    }
    async requestDashboardUpdate(serverId) {
        const state = this.getServerStateMut(serverId);
        const dashboardMessageLocation = this.config.getInServer(serverId, "dashboardMessage");
        if (!dashboardMessageLocation) {
            return;
        }
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
        this.generateMessage(null, serverId).then(message => state.dashboardMessageCache?.edit(message))
            .catch(err => { logger_1.default.warn(err); });
        (0, wait_1.default)(ActivityDashboard.DASHBOARD_UPDATE_COOLDOWN_TIME).then(() => {
            state.onCooldown = false;
            if (state.newChangesAfterCooldown) {
                return this.requestDashboardUpdate(serverId);
            }
        });
        this.setChannelNameTimerUpdaterTimer(serverId).catch(err => logger_1.default.error(err));
    }
    /** Updates the channel name timer if required, then, sets the (channel name timer)-updating timer */
    async setChannelNameTimerUpdaterTimer(serverId) {
        if (!this.config.getInServer(serverId, "liveChannelName")) {
            return;
        }
        const state = this.getServerStateMut(serverId);
        if (state.channelNameUpdateInterval) {
            clearTimeout(state.channelNameUpdateInterval);
        }
        const lastRecord = state.activity.getLastRecord();
        if (!lastRecord) {
            return;
        }
        const { channelNameTimerString, nextUpdate } = this.getChannelNameTimerString((Date.now() / 1000 - lastRecord.timestamp) / 60);
        if (channelNameTimerString !== state.channelNameTimerString) {
            state.channelNameTimerString = channelNameTimerString;
            const dashboardMessageLocation = this.config.getInServer(serverId, "dashboardMessage");
            const [dashboardMessageChannelId, _] = dashboardMessageLocation.split("-");
            const channel = await this.bot.client.getChannel(dashboardMessageChannelId);
            if (channel && 'setName' in channel) {
                logger_1.default.log_message("Update activity dashboard channel name timer", channelNameTimerString);
                if (channelNameTimerString) {
                    await channel.setName(`activity-${channelNameTimerString}`);
                }
                else {
                    await channel.setName("activity-dashboard");
                }
            }
        }
        if (nextUpdate) {
            state.channelNameUpdateInterval = setTimeout(() => {
                this.setChannelNameTimerUpdaterTimer(serverId);
            }, nextUpdate);
        }
    }
    getChannelNameTimerString(minutesAgo) {
        if (minutesAgo < 5) {
            return { channelNameTimerString: "just-now", nextUpdate: 5 * 60 * 1000 };
        }
        if (minutesAgo < 55) { // 55 and not 60, since 55 would round up to "60m", which should be "1h"
            return { channelNameTimerString: Math.round(minutesAgo / 10) * 10 + "m-ago", nextUpdate: 10 * 60 * 1000 };
        }
        if (minutesAgo < 60 * 12) {
            return { channelNameTimerString: Math.round(minutesAgo / 60) + "h-ago", nextUpdate: 60 * 60 * 1000 };
        }
        // channelNameTimerString:
        //  undefined - don't know
        //  null - long time, use default name
        //  string - <string> time ago
        return { channelNameTimerString: null, nextUpdate: undefined };
    }
    async generateMessage(event, serverId) {
        const activityLog = this.getServerStateMut(serverId).activity.getRecords();
        const channelFields = [];
        const promises = [];
        let messageTotalLength = 0;
        for (const [channelId, records] of activityLog) {
            const message = new ReversedMessageBuilder();
            const iMin = Math.max(0, records.length - ActivityDashboard.LINES_PER_CHANNEL_MAX);
            for (let i = records.length - 1; i >= iMin; i--) {
                const activity = records[i];
                let messageText = activity.message;
                if (activity.type !== 'reacted') {
                    messageText = (0, ellipsisize_1.default)((0, removeFormattingChars_1.default)((await (0, unmentionify_1.unMentionify)(this.bot, messageText))
                        // prevent discord safety from destroying message
                        .replace(/https?:\/\//g, "")
                        .replace(/</g, "")
                        .replace(/>/g, "")
                        // make everything one line
                        .replaceAll("\n", "/")), 50);
                }
                message.addLine(`<t:${activity.timestamp}:R> ${(0, mention_1.default)(activity.userId)} [${activity.type}: ${messageText}](https://discord.com/channels/${serverId}/${activity.channelId}/${activity.messageId})`);
                if (message.getCharCount() > ActivityDashboard.EMBED_FIELD_VALUE_MAX_LENGTH) {
                    message.removeLastLine();
                    break;
                }
            }
            message.addLine("Open " + (0, mentionChannel_1.default)(channelId));
            if (message.getCharCount() > ActivityDashboard.EMBED_FIELD_VALUE_MAX_LENGTH) {
                message.removeLastLine(); // in case channel mention tips the message over the limit
            }
            promises.push(this.bot.client.getChannel(channelId).then(channel => {
                const name = (channel && 'name' in channel && channel.name) ? channel.name : "Untitled";
                const value = message.getMessage();
                messageTotalLength += name.length + value.length;
                channelFields.push([records[records.length - 1].timestamp, { name, value }]);
            }).catch(() => { }));
        }
        await Promise.all(promises);
        channelFields.sort((a, b) => a[0] - b[0]);
        // ensure message total length is less than 6000 chars
        while (messageTotalLength > ActivityDashboard.EMBED_MAX_TOTAL_CHARS) {
            const channelField = channelFields.shift();
            if (!channelField) {
                break;
            }
            messageTotalLength -= channelField[1].name.length + channelField[1].value.length;
        }
        return {
            content: this.config.getInServer(serverId, "enabled") ?
                "Activity Dashboard"
                : `Note: Tracking messages for activity dashboard is disabled. Send \`${event?.precommandName.name || ""}config activityDashboard s here enabled true\` to enable tracking.`,
            embeds: [{
                    description: channelFields.length ? undefined : "_Empty_",
                    fields: channelFields.slice(-ActivityDashboard.EMBED_FIELDS_MAX_LENGTH).map(x => x[1]),
                    timestamp: new Date().toISOString()
                }],
            allowedMentions: { users: [] }
        };
    }
    serializeActivityHistory() {
        const map = new Map();
        for (const [key, serverState] of this.serverStates) {
            map.set(key, serverState.activity.serialize());
        }
        return Object.fromEntries(map);
    }
    _start() {
        this.messageHandler = this.messageHandler.bind(this);
        this.bot.events.message.addHandler(this.messageHandler);
        this.messageEditHandler = this.messageEditHandler.bind(this);
        this.bot.client.client.on("messageUpdate", this.messageEditHandler);
        this.reactHandler = this.reactHandler.bind(this);
        this.bot.client.client.on("messageReactionAdd", this.reactHandler);
        this._registerDefaultCommand("activity dashboard", this.activityDashboard, {
            help: {
                description: "Summons a live activity dashboard which lists recent activity on a server",
                examples: [
                    ["activity dashboard", "Summons an activity dashboard"]
                ]
            },
            requiredDiscordPermission: "Administrator"
        });
        this.bot.events.beforeMemoryWrite.addHandler(() => {
            this.bot.memory.write(this.pluginName, "activityHistory", this.serializeActivityHistory());
        });
        this.bot.events.ready.addHandler(() => {
            // start channel name timer updaters
            for (const [id, server] of this.serverStates) {
                this.setChannelNameTimerUpdaterTimer(id).catch(err => logger_1.default.error(err));
            }
        });
    }
    _stop() {
        this.bot.events.message.removeHandler(this.messageHandler);
        this.bot.client.client.off("messageUpdate", this.messageEditHandler);
        this.bot.client.client.off("messageReactionAdd", this.reactHandler);
    }
}
class Activity {
    activityRecords = [];
    activityPerChannelCache = new Map();
    add(record) {
        if (this.tryAddByMerge(record)) {
            return;
        }
        this.activityRecords.push(record);
        const records = this.getRecordsInChannel(record.channelId);
        records.push(record);
        this.removeOldRecordsIfNeeded();
    }
    getLastRecord() {
        return this.activityRecords[this.activityRecords.length - 1];
    }
    /**
     * Tries to add to activityRecords by merging with an existing ActivityRecord.
     *
     * Returns true if merged, false if not.
     */
    tryAddByMerge(record) {
        const recordsInChannel = this.getRecordsInChannel(record.channelId);
        const lastRecord = recordsInChannel[recordsInChannel.length - 1];
        if (!lastRecord) {
            return false;
        }
        if ( // merge conditions
        lastRecord.type === record.type &&
            lastRecord.userId === record.userId &&
            record.timestamp - lastRecord.timestamp < 10 * 60 // sent within 10 minutes
        ) {
            if (lastRecord.type === "edited") {
                lastRecord.message = record.message;
            }
            else if (lastRecord.type === "reacted") {
                lastRecord.message = (lastRecord.message + record.message).slice(0, 5000);
            }
            else { // lastRecord.type === "sent"
                lastRecord.message = (lastRecord.message + "\n" + record.message).slice(0, 5000);
            }
            lastRecord.timestamp = record.timestamp;
            // move record back to top
            (0, removeFromArray_1.default)(this.activityRecords, lastRecord);
            this.activityRecords.push(lastRecord);
            return true;
        }
        return false;
    }
    removeOldRecordsIfNeeded() {
        while (this.activityRecords.length > ActivityDashboard.ACTIVITY_HISTORY_MAX_LENGTH) {
            let oldestChannel;
            let lastMessageTime = Infinity;
            for (const [id, records] of this.activityPerChannelCache) {
                if (records.length <= 0) {
                    continue;
                }
                if (records[0].timestamp < lastMessageTime) {
                    oldestChannel = id;
                    lastMessageTime = records[0].timestamp;
                }
            }
            if (oldestChannel) {
                const records = this.getRecordsInChannel(oldestChannel);
                const removed = records.shift();
                if (records.length <= 0) {
                    this.activityPerChannelCache.delete(oldestChannel);
                }
                if (removed) {
                    (0, removeFromArray_1.default)(this.activityRecords, removed);
                }
            }
            else {
                const removed = this.activityRecords.shift();
                if (removed) {
                    const records = this.getRecordsInChannel(removed.channelId);
                    if (records[0] === removed) {
                        records.shift();
                        if (records.length <= 0) {
                            this.activityPerChannelCache.delete(removed.channelId);
                        }
                    }
                    else {
                        logger_1.default.warn(new Error("Failed to removed an activity record in per channel cache"));
                    }
                }
            }
        }
    }
    getRecords() {
        return this.activityPerChannelCache;
    }
    serialize() {
        return this.activityRecords;
    }
    deserialize(data) {
        for (const item of data) {
            this.add(item);
        }
    }
    getRecordsInChannel(channelId) {
        const existing = this.activityPerChannelCache.get(channelId);
        if (existing) {
            return existing;
        }
        else {
            const newRecords = [];
            this.activityPerChannelCache.set(channelId, newRecords);
            return newRecords;
        }
    }
}
/**
 * Reversed Message Builder builds messages from the bottom, line-per-line.
 *
 * Helps keep messages below a 2000 character limit.
 */
class ReversedMessageBuilder {
    lines = [];
    charCount = 0;
    addLine(line) {
        if (this.lines.length > 0) {
            this.charCount += 1;
        } // newline character count
        this.lines.push(line);
        this.charCount += line.length;
    }
    getCharCount() {
        return this.charCount;
    }
    removeLastLine() {
        const line = this.lines.pop();
        if (line === undefined) {
            return;
        }
        this.charCount -= line.length;
        if (this.lines.length > 0) {
            this.charCount -= 1;
        } // newline character count
    }
    getMessage() {
        this.lines.reverse();
        const str = this.lines.join("\n");
        this.lines.reverse();
        return str;
    }
}
exports.default = ActivityDashboard;
