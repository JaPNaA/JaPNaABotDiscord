import { APIEmbedField, Message, MessageCreateOptions, MessageEditOptions, MessageReaction, PartialMessage, PartialMessageReaction, PartialUser, User } from "discord.js";
import { ReplySoft } from "../main/bot/actions/actions";
import Bot from "../main/bot/bot/bot";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent";
import DiscordMessageEvent from "../main/bot/events/discordMessageEvent";
import BotPlugin from "../main/bot/plugin/plugin";
import { JSONObject, JSONType } from "../main/types/jsonObject";
import wait from "../main/utils/async/wait";
import Logger from "../main/utils/logger";
import removeFromArray from "../main/utils/removeFromArray";
import ellipsisize from "../main/utils/str/ellipsisize";
import mention from "../main/utils/str/mention";
import mentionChannel from "../main/utils/str/mentionChannel";
import removeFormattingChars from "../main/utils/str/removeFormattingChars";

class ActivityDashboard extends BotPlugin {
    public static readonly DASHBOARD_UPDATE_COOLDOWN_TIME = 5000;
    public static readonly ACTIVITY_HISTORY_MAX_LENGTH = 50;
    public static readonly EMBED_FIELD_VALUE_MAX_LENGTH = 1024;
    public static readonly EMBED_FIELDS_MAX_LENGTH = 25;
    public static readonly LINES_PER_CHANNEL_MAX = 5;

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
        },
        liveChannelName: {
            type: "boolean",
            comment: "Update the channel name to indicate recent activity? (ex. '#activity-12m-ago'). The channel with the activity dashboard message's name will be updated. (Server-level config only)",
            default: false
        }
    };

    private serverStates: Map<string, ServerState> = new Map();

    constructor(bot: Bot) {
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

    private getServerStateMut(serverId: string): ServerState {
        const state = this.serverStates.get(serverId);
        if (state) {
            return state;
        } else {
            const newState = { activity: new Activity() };
            this.serverStates.set(serverId, newState);
            return newState;
        }
    }

    private async messageHandler(event: DiscordMessageEvent) {
        return this.maybeRecordAndUpdate(event.serverId, {
            timestamp: this.secondTimestamp(event.createdTimestamp),
            userId: event.userId,
            type: "sent",
            message: event.message,
            messageId: event.messageId,
            channelId: event.channelId
        });
    }

    private async messageEditHandler(oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage) {
        // change not relevant
        if (oldMessage.content === newMessage.content && oldMessage.attachments.size === newMessage.attachments.size) { return; }
        // probably not a message edit
        if (newMessage.partial) { return; }

        return this.maybeRecordAndUpdate(newMessage.guildId || "", {
            timestamp: this.secondTimestamp(newMessage.editedTimestamp || Date.now()),
            userId: newMessage.author?.id || "",
            type: "edited",
            message: newMessage.content || "",
            messageId: newMessage.id,
            channelId: newMessage.channelId
        });
    }

    private async reactHandler(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
        return this.maybeRecordAndUpdate(reaction.message.guildId || "", {
            timestamp: this.secondTimestamp(Date.now()),
            userId: user.id,
            type: "reacted",
            message: reaction.emoji.id ? `<${reaction.emoji.animated ? 'a' : ''}:${reaction.emoji.name}:${reaction.emoji.id}>` : reaction.emoji.name || "",
            messageId: reaction.message.id,
            channelId: reaction.message.channelId
        });
    }

    private secondTimestamp(millisecondTimestamp: number) {
        return Math.round(millisecondTimestamp / 1000);
    }

    private async maybeRecordAndUpdate(serverId: string, record: ActivityRecord) {
        if (record.userId === this.bot.client.id) { return; }

        const config = await this.config.getAllUserSettingsInChannel(record.channelId);
        if (!config.get("enabled")) { return; }

        const state = this.getServerStateMut(serverId);
        state.activity.add(record);

        if (config.get("dashboardMessage")) {
            await this.requestDashboardUpdate(serverId);
        }
    }

    public async *activityDashboard(event: DiscordCommandEvent) {
        const reply = new ReplySoft(await this.generateMessage(event, event.serverId));
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

        this.generateMessage(null, serverId).then(message => state.dashboardMessageCache?.edit(message))
            .catch(err => { });

        wait(ActivityDashboard.DASHBOARD_UPDATE_COOLDOWN_TIME).then(() => {
            state.onCooldown = false;

            if (state.newChangesAfterCooldown) {
                return this.requestDashboardUpdate(serverId);
            }
        });

        this.setChannelNameTimerUpdaterTimer(serverId).catch(err => Logger.error(err));
    }

    /** Updates the channel name timer if required, then, sets the (channel name timer)-updating timer */
    private async setChannelNameTimerUpdaterTimer(serverId: string) {
        if (!this.config.getInServer(serverId, "liveChannelName")) { return; }

        const state = this.getServerStateMut(serverId);
        if (state.channelNameUpdateInterval) {
            clearTimeout(state.channelNameUpdateInterval);
        }

        const lastRecord = state.activity.getLastRecord();
        if (!lastRecord) { return; }
        const { channelNameTimerString, nextUpdate } = this.getChannelNameTimerString(
            (Date.now() / 1000 - lastRecord.timestamp) / 60,
        );

        if (channelNameTimerString !== state.channelNameTimerString) {
            state.channelNameTimerString = channelNameTimerString;

            const dashboardMessageLocation = this.config.getInServer(serverId, "dashboardMessage") as string;
            const [dashboardMessageChannelId, _] = dashboardMessageLocation.split("-");
            const channel = await this.bot.client.getChannel(dashboardMessageChannelId);

            if (channel && 'setName' in channel) {
                Logger.log_message("Update activity dashboard channel name timer", channelNameTimerString);
                if (channelNameTimerString) {
                    await channel.setName(`activity-${channelNameTimerString}`);
                } else {
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

    private getChannelNameTimerString(minutesAgo: number): { channelNameTimerString: string | null, nextUpdate: number | undefined } {
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

    private async generateMessage(event: DiscordCommandEvent | null, serverId: string): Promise<MessageCreateOptions & MessageEditOptions> {
        const activityLog = this.getServerStateMut(serverId).activity.getRecords();
        const channelFields: [number, APIEmbedField][] = [];

        const promises = [];

        for (const [channelId, records] of activityLog) {
            const message = new ReversedMessageBuilder();
            const iMin = Math.max(0, records.length - ActivityDashboard.LINES_PER_CHANNEL_MAX);

            for (let i = records.length - 1; i >= iMin; i--) {
                const activity = records[i];
                let messageText = activity.message;
                if (activity.type !== 'reacted') {
                    messageText = ellipsisize(removeFormattingChars(messageText.replaceAll("\n", "/")), 50);
                }
                message.addLine(`<t:${activity.timestamp}:R> ${mention(activity.userId)} [${activity.type}: ${messageText}](https://discord.com/channels/${serverId}/${activity.channelId}/${activity.messageId})`);
                if (message.getCharCount() > ActivityDashboard.EMBED_FIELD_VALUE_MAX_LENGTH) {
                    message.removeLastLine();
                    break;
                }
            }

            message.addLine("Open " + mentionChannel(channelId));

            promises.push(this.bot.client.getChannel(channelId).then(channel => {
                channelFields.push([
                    records[records.length - 1].timestamp,
                    {
                        name: channel ? ('name' in channel && channel.name ? channel.name : "Untitled") : "Untitled",
                        value: message.getMessage()
                    }
                ]);
            }).catch(() => { }));
        }

        await Promise.all(promises);

        channelFields.sort((a, b) => a[0] - b[0]);

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

    private serializeActivityHistory(): JSONObject {
        const map = new Map<string, JSONType>();
        for (const [key, serverState] of this.serverStates) {
            map.set(key, serverState.activity.serialize());
        }
        return Object.fromEntries(map);
    }

    public _start(): void {
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
                this.setChannelNameTimerUpdaterTimer(id).catch(err => Logger.error(err));
            }
        });
    }

    public _stop(): void | Promise<void> {
        this.bot.events.message.removeHandler(this.messageHandler);
        this.bot.client.client.off("messageUpdate", this.messageEditHandler);
        this.bot.client.client.off("messageReactionAdd", this.reactHandler);
    }

}

interface ServerState {
    activity: Activity;
    channelNameUpdateInterval?: NodeJS.Timeout;
    channelNameTimerString?: string | null; // number of minutes on channel name
    dashboardMessageCache?: Message;
    onCooldown?: boolean;
    newChangesAfterCooldown?: boolean;
}

class Activity {
    private activityRecords: ActivityRecord[] = [];

    private activityPerChannelCache: Map<string, ActivityRecord[]> = new Map();

    public add(record: ActivityRecord) {
        if (this.tryAddByMerge(record)) { return; }

        this.activityRecords.push(record);
        const records = this.getRecordsInChannel(record.channelId);
        records.push(record);

        this.removeOldRecordsIfNeeded();
    }

    public getLastRecord() {
        return this.activityRecords[this.activityRecords.length - 1];
    }

    /**
     * Tries to add to activityRecords by merging with an existing ActivityRecord.
     * 
     * Returns true if merged, false if not.
     */
    private tryAddByMerge(record: ActivityRecord): boolean {
        const recordsInChannel = this.getRecordsInChannel(record.channelId);
        const lastRecord = recordsInChannel[recordsInChannel.length - 1];
        if (!lastRecord) { return false; }
        if ( // merge conditions
            lastRecord.type === record.type &&
            lastRecord.userId === record.userId &&
            record.timestamp - lastRecord.timestamp < 10 * 60 // sent within 10 minutes
        ) {
            if (lastRecord.type === "edited") {
                lastRecord.message = record.message;
            } else if (lastRecord.type === "reacted") {
                lastRecord.message = (lastRecord.message + record.message).slice(0, 5000);
            } else { // lastRecord.type === "sent"
                lastRecord.message = (lastRecord.message + "\n" + record.message).slice(0, 5000);
            }
            lastRecord.timestamp = record.timestamp;

            // move record back to top
            removeFromArray(this.activityRecords, lastRecord);
            this.activityRecords.push(lastRecord);
            return true;
        }
        return false;
    }

    private removeOldRecordsIfNeeded() {
        while (this.activityRecords.length > ActivityDashboard.ACTIVITY_HISTORY_MAX_LENGTH) {
            let channelWithMostRecords;
            let mostRecords = 0;
            for (const [id, records] of this.activityPerChannelCache) {
                if (records.length > mostRecords) {
                    channelWithMostRecords = id;
                    mostRecords = records.length;
                }
            }

            if (channelWithMostRecords) {
                const records = this.getRecordsInChannel(channelWithMostRecords);
                const removed = records.shift();
                if (records.length <= 0) { this.activityPerChannelCache.delete(channelWithMostRecords); }
                if (removed) { removeFromArray(this.activityRecords, removed); }
            } else {
                const removed = this.activityRecords.shift();
                if (removed) {
                    const records = this.getRecordsInChannel(removed.channelId);
                    if (records[0] === removed) {
                        records.shift();
                        if (records.length <= 0) { this.activityPerChannelCache.delete(removed.channelId); }
                    } else {
                        Logger.warn(new Error("Failed to removed an activity record in per channel cache"));
                    }
                }
            }
        }
    }

    public getRecords(): Readonly<Map<string, readonly Readonly<ActivityRecord>[]>> {
        return this.activityPerChannelCache;
    }

    public serialize(): JSONType {
        return this.activityRecords as any as JSONType;
    }

    public deserialize(data: JSONType) {
        for (const item of data as JSONObject[]) {
            this.add(item as any as ActivityRecord);
        }
    }

    private getRecordsInChannel(channelId: string) {
        const existing = this.activityPerChannelCache.get(channelId);
        if (existing) {
            return existing;
        } else {
            const newRecords: ActivityRecord[] = [];
            this.activityPerChannelCache.set(channelId, newRecords);
            return newRecords;
        }
    }
}

interface ActivityRecord {
    timestamp: number;
    userId: string;
    channelId: string;
    message: string;
    messageId: string;
    type: "sent" | "reacted" | "edited";
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
