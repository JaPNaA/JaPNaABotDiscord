"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_js_1 = __importDefault(require("../main/bot/plugin/plugin.js"));
const commandOptions_js_1 = __importDefault(require("../main/bot/command/commandOptions.js"));
const allUtils_js_1 = require("../main/utils/allUtils.js");
const commandHelp_js_1 = __importDefault(require("../main/bot/command/commandHelp.js"));
const logger_js_1 = __importDefault(require("../main/utils/logger.js"));
const mention_js_1 = __importDefault(require("../main/utils/str/mention.js"));
/**
 * Reminders plugin
 */
class Reminders extends plugin_js_1.default {
    constructor(bot) {
        super(bot);
        this._timeUnits = {
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
        this._reminders = [];
        this._remindersTimeoutId = null;
        this._pluginName = "reminder";
    }
    set_reminder(bot, event, argStr) {
        const args = allUtils_js_1.stringToArgs(argStr);
        const [time, units] = args;
        const title = args.slice(2);
        let timeValue = parseFloat(time);
        let unitsValue = this._timeUnits[units];
        if (isNaN(timeValue)) {
            timeValue = 1;
            unitsValue = this._timeUnits.hours;
            title.unshift(time, units);
        }
        else if (!unitsValue) {
            unitsValue = this._timeUnits.hours;
            title.unshift(units);
        }
        const now = Date.now();
        const reminder = {
            channelId: event.channelId,
            setTime: now,
            setterUserId: event.userId,
            targetTime: now + timeValue * unitsValue,
            title: title.join(" ")
        };
        this._addReminder(reminder);
        bot.send(event.channelId, `Reminder set on ${new Date(reminder.targetTime).toLocaleString()}: **${reminder.title}**`);
    }
    _addReminder(reminder) {
        this._reminders.push(reminder);
        this._reminders.sort((a, b) => a.targetTime - b.targetTime);
        this._updateReminders();
    }
    _updateReminders() {
        this._stopReminderTimeout();
        this.bot.memory.write(this._pluginName, "reminders", this._reminders);
        const nextReminder = this._reminders[0];
        if (!nextReminder) {
            return;
        }
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
    _sendReminder(reminder) {
        const index = this._reminders.indexOf(reminder);
        if (index < 0) {
            logger_js_1.default.error("Tried to send reminder not in this._reminders");
            return;
        }
        this._reminders.splice(index, 1);
        this.bot.send(reminder.channelId, `Reminder: **${reminder.title}**\nSet on ${new Date(reminder.setTime).toLocaleString()} by ${mention_js_1.default(reminder.setterUserId)}`);
    }
    _start() {
        const existingReminders = this.bot.memory.get(this._pluginName, "reminders");
        if (existingReminders) {
            this._reminders = existingReminders;
            if (this.bot.client.isReady()) {
                this._updateReminders();
            }
            else {
                this.bot.addEventListener("ready", () => {
                    this._updateReminders();
                });
            }
        }
        this._registerDefaultCommand("set reminder", this.set_reminder, new commandOptions_js_1.default({
            group: "Reminders",
            help: new commandHelp_js_1.default({
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
    _stop() {
        this._stopReminderTimeout();
    }
}
exports.default = Reminders;
