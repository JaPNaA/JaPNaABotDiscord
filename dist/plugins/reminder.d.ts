import Bot from "../main/bot/bot/bot.js";
import DiscordMessageEvent from "../main/bot/events/discordMessageEvent";
import BotPlugin from "../main/bot/plugin/plugin.js";
/**
 * Reminders plugin
 */
declare class Reminders extends BotPlugin {
    private _timeUnits;
    private _reminders;
    private _remindersTimeoutId;
    constructor(bot: Bot);
    set_reminder(bot: Bot, event: DiscordMessageEvent, argStr: string): void;
    list_reminders(bot: Bot, event: DiscordMessageEvent): void;
    cancel_reminder(bot: Bot, event: DiscordMessageEvent, argStr: string): void;
    _addReminder(reminder: Reminder): void;
    _getChannelReminders(channelId: string): Reminder[];
    _updateReminders(): void;
    _stopReminderTimeout(): void;
    _sendReminder(reminder: Reminder): void;
    _getMessageLink(event: DiscordMessageEvent): string;
    _start(): void;
    _stop(): void;
}
interface Reminder {
    title: string;
    targetTime: number;
    channelId: string;
    setterUserId: string;
    setTime: number;
}
export default Reminders;
