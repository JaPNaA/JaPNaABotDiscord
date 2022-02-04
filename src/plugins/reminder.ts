import Bot from "../main/bot/bot/bot.js";
import DiscordMessageEvent from "../main/bot/events/discordMessageEvent";

import BotPlugin from "../main/bot/plugin/plugin.js";
import { stringToArgs } from "../main/utils/allUtils.js";
import Logger from "../main/utils/logger.js";
import mention from "../main/utils/str/mention.js";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent.js";

/**
 * Reminders plugin
 */
class Reminders extends BotPlugin {
    private _timeUnits: { [x: string]: number } = {
        "ms": 1,
        "millisecond": 1,
        "milliseconds": 1,
        "milli": 1,
        "millis": 1,
        "s": 1000,
        "sec": 1000,
        "secs": 1000,
        "second": 1000,
        "seconds": 1000,
        "m": 60e3,
        "min": 60e3,
        "mins": 60e3,
        "minute": 60e3,
        "minutes": 60e3,
        "h": 3600e3,
        "hr": 3600e3,
        "hrs": 3600e3,
        "hour": 3600e3,
        "hours": 3600e3,
        "d": 8.64e7,
        "day": 8.64e7,
        "days": 8.64e7
    };

    private _reminders: Reminder[];
    private _remindersTimeoutId: NodeJS.Timeout | null = null;

    constructor(bot: Bot) {
        super(bot);
        this.pluginName = "reminder";
        this._reminders = this.bot.memory.get(this.pluginName, "reminders") || [];
    }

    set_reminder(event: DiscordCommandEvent) {
        const args = stringToArgs(event.arguments);
        const [time, units] = args;
        const title = args.slice(2);

        let timeValue = parseFloat(time);
        let unitsValue = this._timeUnits[units];

        if (isNaN(timeValue)) {
            timeValue = 1;
            unitsValue = this._timeUnits.hours;
            title.unshift(time, units);
        } else if (!unitsValue) {
            unitsValue = this._timeUnits.hours;
            title.unshift(units);
        }

        const now = Date.now();

        const reminder: Reminder = {
            channelId: event.channelId,
            setTime: now,
            setterUserId: event.userId,
            targetTime: now + timeValue * unitsValue,
            title: title.join(" ").trim() || this._getMessageLink(event)
        };

        this._addReminder(reminder);

        this.bot.client.send(event.channelId, `Reminder set on ${new Date(reminder.targetTime).toLocaleString()}: **${reminder.title}**`);
    }

    list_reminders(event: DiscordCommandEvent) {
        const reminders = this._getChannelReminders(event.channelId);

        const strArr = [];
        let index = 1;
        for (const reminder of reminders) {
            strArr.push(
                `${index++}. ${new Date(reminder.targetTime).toLocaleString()}: **${reminder.title}**`
            );
        }
        this.bot.client.send(event.channelId, strArr.join("\n"));
    }

    cancel_reminder(event: DiscordCommandEvent) {
        const index = parseInt(event.arguments) - 1;
        if (isNaN(index)) {
            this.bot.client.send(event.channelId, "Invalid index. Specify an integer");
            return;
        }

        const reminder = this._getChannelReminders(event.channelId)[index];
        if (!reminder) {
            this.bot.client.send(event.channelId, "No reminder is at index " + event.arguments);
            return;
        }

        const actualIndex = this._reminders.indexOf(reminder);
        if (actualIndex < 0) { throw new Error("Reminder not found in database"); }
        this._reminders.splice(actualIndex, 1);
        this.bot.client.send(event.channelId,
            "Reminder **" + reminder.title + "** from " +
            mention(reminder.setterUserId) + "was canceled."
        );
    }

    _addReminder(reminder: Reminder) {
        if (this._reminders.length >= 1e4) { throw new Error("Too many reminders scheduled"); }
        this._reminders.push(reminder);
        this._reminders.sort((a, b) => a.targetTime - b.targetTime);
        this._updateReminders();
    }

    _getChannelReminders(channelId: string) {
        const reminders = [];
        for (const reminder of this._reminders) {
            if (reminder.channelId == channelId) {
                reminders.push(reminder);
            }
        }
        return reminders;
    }

    _updateReminders() {
        this._stopReminderTimeout();

        this.bot.memory.write(this.pluginName, "reminders", this._reminders);

        const nextReminder = this._reminders[0];
        if (!nextReminder) { return; }

        const MAX_TIMEOUT_INTERVAL = 2147483647;

        this._remindersTimeoutId = setTimeout(() => {
            if (Date.now() >= nextReminder.targetTime) {
                this._sendReminder(nextReminder);
            }
            this._updateReminders();
        }, Math.min(nextReminder.targetTime - Date.now(), MAX_TIMEOUT_INTERVAL));
    }

    _stopReminderTimeout() {
        if (this._remindersTimeoutId !== null) {
            clearTimeout(this._remindersTimeoutId);
            this._remindersTimeoutId = null;
        }
    }

    _sendReminder(reminder: Reminder) {
        const index = this._reminders.indexOf(reminder);
        if (index < 0) { Logger.error("Tried to send reminder not in this._reminders"); return; }
        this._reminders.splice(index, 1);

        this.bot.client.send(reminder.channelId,
            `Reminder: **${reminder.title}**\nSet on ${new Date(reminder.setTime).toLocaleString()} by ${mention(reminder.setterUserId)}`
        );
        this._updateReminders();
    }

    _getMessageLink(event: DiscordMessageEvent): string {
        return `https://discord.com/channels/${event.serverId || "@me"}/${event.channelId}/${event.messageId}`;
    }

    _start(): void {
        if (this._reminders.length > 0) {
            if (this.bot.client.isReady()) {
                this._updateReminders();
            } else {
                this.bot.events.on("ready", () => {
                    this._updateReminders();
                });
            }
        }

        this._registerDefaultCommand("set reminder", this.set_reminder, {
            group: "Reminders",
            help: {
                description: "Sets a reminder. The bot will send a message in the channel the reminder was set on the set time. (For weird technical limitations, the command is disabled in DMs)",
                examples: [
                    ["set reminder 10 mins check the oven", "Sets a reminder in 10 minutes with the title 'check the oven'"],
                    ["set reminder 10 check the oven", "Sets a reminder in 10 **hours** with the title 'check the oven'"],
                    ["set reminder check the oven", "Sets a reminder in **1 hour** with the title 'check the oven'"]
                ],
                overloads: [{
                    "[number]": "Optional. Number of (unit)s later to set reminder",
                    "[unit]": "Optional. The units of number",
                    "...title": "The title of the reminder"
                }]
            },
            noDM: true
        });

        this._registerDefaultCommand("list reminders", this.list_reminders, {
            group: "Reminders",
            help: {
                description: "Lists the reminders in a channel"
            }
        });

        this._registerDefaultCommand("cancel reminder", this.cancel_reminder, {
            group: "Reminders",
            help: {
                description: "Cancel a reminder given index in channel",
                examples: [
                    ["cancel reminder 1", "Cancels the first reminder"]
                ],
                overloads: [{
                    "<index>": "Number. The index of the event from the `list reminders` command."
                }]
            }
        });
    }

    _stop(): void {
        this._stopReminderTimeout();
    }
}

interface Reminder {
    title: string,
    targetTime: number,
    channelId: string,
    setterUserId: string,
    setTime: number
}

export default Reminders;