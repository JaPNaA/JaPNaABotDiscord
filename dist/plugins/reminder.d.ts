import Bot from "../main/bot/bot/bot.js";
import DiscordMessageEvent from "../main/bot/events/discordMessageEvent";
import BotPlugin from "../main/bot/plugin/plugin.js";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent.js";
import { ReplyUnimportant } from "../main/bot/actions/actions.js";
/**
 * Reminders plugin
 */
declare class Reminders extends BotPlugin {
    static hardMinimumReminderRepeatInterval: number;
    userConfigSchema: {
        minRepeatInterval: {
            type: string;
            comment: string;
            default: number;
        };
    };
    private _timeUnits;
    private _reminders;
    private _remindersTimeoutId;
    constructor(bot: Bot);
    set_reminder(event: DiscordCommandEvent): AsyncGenerator<string, ReplyUnimportant | undefined, unknown>;
    edit_reminder(event: DiscordCommandEvent): AsyncGenerator<string, void, unknown>;
    list_reminders(event: DiscordCommandEvent): Generator<string, void, unknown>;
    cancel_reminder(event: DiscordCommandEvent): Generator<string, void, unknown>;
    _parseTimeStr(timeStr: string, relativeNow: number): number;
    _addReminder(reminder: Reminder): void;
    _sortReminders(): void;
    _getReminderByIndexOrTitle(indexOrTitle: string, channelId: string): Reminder;
    _getChannelReminders(channelId: string): Reminder[];
    _updateReminders(): void;
    _stopReminderTimeout(): void;
    _sendReminder(reminder: Reminder): void;
    _getMessageLink(event: DiscordMessageEvent): string;
    _reminderToString(reminder: Reminder): string;
    _start(): void;
    _stop(): void;
}
interface Reminder {
    title: string;
    targetTime: number;
    channelId: string;
    serverId?: string;
    setterUserId: string;
    setTime: number;
    repeat?: boolean;
    interval?: number[];
}
export default Reminders;
