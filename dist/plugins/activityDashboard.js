"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const actions_1 = require("../main/bot/actions/actions");
const plugin_1 = __importDefault(require("../main/bot/plugin/plugin"));
const wait_1 = __importDefault(require("../main/utils/async/wait"));
const logger_1 = __importDefault(require("../main/utils/logger"));
const ellipsisize_1 = __importDefault(require("../main/utils/str/ellipsisize"));
const mention_1 = __importDefault(require("../main/utils/str/mention"));
const mentionChannel_1 = __importDefault(require("../main/utils/str/mentionChannel"));
const removeFormattingChars_1 = __importDefault(require("../main/utils/str/removeFormattingChars"));
class ActivityDashboard extends plugin_1.default {
    static DASHBOARD_UPDATE_COOLDOWN_TIME = 5000;
    static ACTIVITY_HISTORY_MAX_LENGTH = 30;
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
        const reply = new actions_1.ReplySoft(await this.generateMessage(event.serverId));
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
        this.generateMessage(serverId).then(message => state.dashboardMessageCache?.edit(message))
            .catch(err => { });
        (0, wait_1.default)(ActivityDashboard.DASHBOARD_UPDATE_COOLDOWN_TIME).then(() => {
            state.onCooldown = false;
            if (state.newChangesAfterCooldown) {
                return this.requestDashboardUpdate(serverId);
            }
        });
    }
    async generateMessage(serverId) {
        const activityLog = this.getServerStateMut(serverId).activity.getRecords();
        const channelFields = [];
        const promises = [];
        for (const [channelId, records] of activityLog) {
            const message = new ReversedMessageBuilder();
            const iMin = Math.max(0, records.length - ActivityDashboard.LINES_PER_CHANNEL_MAX);
            for (let i = records.length - 1; i >= iMin; i--) {
                const activity = records[i];
                let messageText = activity.message;
                if (activity.type !== 'reacted') {
                    messageText = (0, ellipsisize_1.default)((0, removeFormattingChars_1.default)(messageText.replaceAll("\n", "/")), 50);
                }
                message.addLine(`<t:${activity.timestamp}:R> ${(0, mention_1.default)(activity.userId)} [${activity.type}: ${messageText}](https://discord.com/channels/${serverId}/${activity.channelId}/${activity.messageId})`);
                if (message.getCharCount() > ActivityDashboard.EMBED_FIELD_VALUE_MAX_LENGTH) {
                    message.removeLastLine();
                    break;
                }
            }
            message.addLine("Open " + (0, mentionChannel_1.default)(channelId));
            promises.push(this.bot.client.getChannel(channelId).then(channel => {
                channelFields.push([
                    records[records.length - 1].timestamp,
                    {
                        name: channel ? ('name' in channel ? channel.name : "Untitled") : "Untitled",
                        value: message.getMessage()
                    }
                ]);
            }));
        }
        await Promise.all(promises);
        channelFields.sort((a, b) => a[0] - b[0]);
        return {
            content: "Activity Dashboard",
            embeds: [{
                    fields: channelFields.slice(-ActivityDashboard.EMBED_FIELDS_MAX_LENGTH).map(x => x[1]),
                    timestamp: Date.now()
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
            requiredDiscordPermission: "ADMINISTRATOR"
        });
        this.bot.events.beforeMemoryWrite.addHandler(() => {
            this.bot.memory.write(this.pluginName, "activityHistory", this.serializeActivityHistory());
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
        this.activityRecords.push(record);
        const records = this.getRecordsInChannel(record.channelId);
        records.push(record);
        while (this.activityRecords.length > ActivityDashboard.ACTIVITY_HISTORY_MAX_LENGTH) {
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
