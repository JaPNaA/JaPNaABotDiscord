import Bot from "../main/bot/bot/bot.js";
import DiscordMessageEvent from "../main/bot/events/discordMessageEvent";
import BotPlugin from "../main/bot/plugin/plugin.js";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent.js";
/**
 * Reminders plugin
 */
declare class Reminders extends BotPlugin {
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
    set_reminder(event: DiscordCommandEvent): Promise<void>;
    list_reminders(event: DiscordCommandEvent): void;
    cancel_reminder(event: DiscordCommandEvent): void;
    _parseTimeStr(timeStr: string, relativeNow: number): number;
    _addReminder(reminder: Reminder): void;
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
    setterUserId: string;
    setTime: number;
    repeat?: boolean;
    interval?: number[];
}
export default Reminders;
