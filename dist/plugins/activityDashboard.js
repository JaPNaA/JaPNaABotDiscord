"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const actions_1 = require("../main/bot/actions/actions");
const plugin_1 = __importDefault(require("../main/bot/plugin/plugin"));
const wait_1 = __importDefault(require("../main/utils/async/wait"));
const ellipsisize_1 = __importDefault(require("../main/utils/str/ellipsisize"));
const mention_1 = __importDefault(require("../main/utils/str/mention"));
const mentionChannel_1 = __importDefault(require("../main/utils/str/mentionChannel"));
const removeFormattingChars_1 = __importDefault(require("../main/utils/str/removeFormattingChars"));
class ActivityDashboard extends plugin_1.default {
    static DASHBOARD_UPDATE_COOLDOWN_TIME = 5000;
    static ACTIVITY_HISTORY_MAX_LENGTH = 30;
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
    }
    getServerStateMut(serverId) {
        const state = this.serverStates.get(serverId);
        if (state) {
            return state;
        }
        else {
            const newState = { activity: [] };
            this.serverStates.set(serverId, newState);
            return newState;
        }
    }
    async messageHandler(event) {
        const config = await this.config.getAllUserSettingsInChannel(event.channelId);
        if (!config.get("enabled")) {
            return;
        }
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
    *activityDashboard(event) {
        const reply = new actions_1.ReplySoft(this.generateMessage(event.serverId));
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
        state.dashboardMessageCache.edit(this.generateMessage(serverId))
            .catch(err => { });
        (0, wait_1.default)(ActivityDashboard.DASHBOARD_UPDATE_COOLDOWN_TIME).then(() => {
            state.onCooldown = false;
            if (state.newChangesAfterCooldown) {
                return this.requestDashboardUpdate(serverId);
            }
        });
    }
    generateMessage(serverId) {
        const activityLog = this.getServerStateMut(serverId).activity;
        const message = new ReversedMessageBuilder();
        message.addLine(`Last updated: <t:${Math.round(Date.now() / 1000)}:R>`);
        for (let i = activityLog.length - 1; i >= 0; i--) {
            const activity = activityLog[i];
            message.addLine(`<t:${activity.timestamp}:R> ${(0, mention_1.default)(activity.userId)} ${(0, mentionChannel_1.default)(activity.channel)}: ${(0, ellipsisize_1.default)((0, removeFormattingChars_1.default)(activity.message), 40)}`);
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
    _start() {
        this.messageHandler = this.messageHandler.bind(this);
        this.bot.events.message.addHandler(this.messageHandler);
        this._registerDefaultCommand("activity dashboard", this.activityDashboard);
    }
    _stop() {
        this.bot.events.message.removeHandler(this.messageHandler);
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
