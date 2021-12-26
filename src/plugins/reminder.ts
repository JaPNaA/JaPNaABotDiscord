import BotHooks from "../main/bot/bot/botHooks.js";
import DiscordMessageEvent from "../main/bot/events/discordMessageEvent";

import BotPlugin from "../main/bot/plugin/plugin.js";
import { User } from "discord.js";
import BotCommandOptions from "../main/bot/command/commandOptions.js";
import { stringToArgs } from "../main/utils/allUtils.js";
import BotCommandHelp from "../main/bot/command/commandHelp.js";
import Logger from "../main/utils/logger.js";
import mention from "../main/utils/str/mention.js";

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

    private _reminders: Reminder[] = [];
    private _remindersTimeoutId: NodeJS.Timeout | null = null;

    constructor(bot: BotHooks) {
        super(bot);
        this._pluginName = "reminder";
    }

    set_reminder(bot: BotHooks, event: DiscordMessageEvent, argStr: string) {
        const args = stringToArgs(argStr);
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
            title: title.join(" ")
        };

        this._addReminder(reminder);

        bot.send(event.channelId, `Reminder set on ${new Date(reminder.targetTime).toLocaleString()}: **${reminder.title}**`);
    }

    _addReminder(reminder: Reminder) {
        this._reminders.push(reminder);
        this._reminders.sort((a, b) => a.targetTime - b.targetTime);
        this._updateReminders();
    }

    _updateReminders() {
        this._stopReminderTimeout();

        this.bot.memory.write(this._pluginName, "reminders", this._reminders);

        const nextReminder = this._reminders[0];
        if (!nextReminder) { return; }

        console.log(nextReminder, nextReminder.targetTime - Date.now());

        this._remindersTimeoutId = setTimeout(() => {
            this._sendReminder(nextReminder);
            this._updateReminders();
        }, nextReminder.targetTime - Date.now());
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

        this.bot.send(reminder.channelId,
            `Reminder: **${reminder.title}**\nSet on ${new Date(reminder.setTime).toLocaleString()} by ${mention(reminder.setterUserId)}`
        );
    }

    _start(): void {
        const existingReminders = this.bot.memory.get(this._pluginName, "reminders");
        if (existingReminders) {
            this._reminders = existingReminders;

            if (this.bot.client.isReady()) {
                this._updateReminders();
            } else {
                this.bot.addEventListener("ready", () => {
                    this._updateReminders();
                });
            }
        }

        this._registerDefaultCommand("set reminder", this.set_reminder, new BotCommandOptions({
            group: "Reminders",
            help: new BotCommandHelp({
                description: "Sets a reminder. The bot will send a message in the channel the reminder was set on the set time.",
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
            })
        }));
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