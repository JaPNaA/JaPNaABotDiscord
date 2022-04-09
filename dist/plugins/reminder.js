"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_js_1 = __importDefault(require("../main/bot/plugin/plugin.js"));
const logger_js_1 = __importDefault(require("../main/utils/logger.js"));
const mention_js_1 = __importDefault(require("../main/utils/str/mention.js"));
const commandArguments_js_1 = __importDefault(require("../main/bot/command/commandArguments.js"));
const RELATIVE_TIME_STR_REGEX = /^(\d+)([a-z]+)$/;
const ABSOLUTE_TIME_STR_REGEX = /^(\d+):(\d+)(:(\d+)(\.(\d+))?)?\s*((a|p)m?)?$/i;
/**
 * Reminders plugin
 */
class Reminders extends plugin_js_1.default {
    userConfigSchema = {
        "minRepeatInterval": {
            type: "number",
            comment: "The minimum interval between repeating reminders",
            default: 60 * 30
        }
    };
    _timeUnits = {
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
    _reminders;
    _remindersTimeoutId = null;
    constructor(bot) {
        super(bot);
        this.pluginName = "reminder";
        this._reminders = this.bot.memory.get(this.pluginName, "reminders") || [];
    }
    async set_reminder(event) {
        const args = new commandArguments_js_1.default(event.arguments).parse({
            overloads: [["--time", "-r", "--repeat-interval", "title"], ["--time", "title"], ["title"]],
            flags: [
                ["--repeat", "--rep", "-r"]
            ],
            namedOptions: [
                ["--repeat-interval", "--interval", "-i"],
                ["--time", "-t"]
            ],
            required: ['--time'],
            check: {
                '--time': (s) => RELATIVE_TIME_STR_REGEX.test(s) || ABSOLUTE_TIME_STR_REGEX.test(s) || !isNaN(Date.parse(s)),
                '--repeat-interval': RELATIVE_TIME_STR_REGEX
            },
            allowMultifinal: true
        });
        const now = Date.now();
        const time = this._parseTimeStr(args.get("--time"), now);
        const title = args.get("title");
        const reminder = {
            channelId: event.channelId,
            setTime: now,
            setterUserId: event.userId,
            targetTime: time,
            title: title || this._getMessageLink(event)
        };
        if (args.get("--repeat")) {
            const intervalStr = args.get("--repeat-interval") || args.get("--time");
            const interval = this._parseTimeStr(intervalStr, 0);
            const minInterval = (await this.config.getInChannel(event.channelId, "minRepeatInterval")) * 1000;
            console.log(intervalStr, interval);
            if (interval < Math.max(2000, minInterval)) { // hardcode min 2 seconds
                throw new Error("Repeat interval is too small.");
            }
            reminder.repeat = true;
            reminder.interval = [interval];
        }
        this._addReminder(reminder);
        this.bot.client.send(event.channelId, `Reminder set on ${this._reminderToString(reminder)}`);
    }
    list_reminders(event) {
        const reminders = this._getChannelReminders(event.channelId);
        const strArr = [];
        let index = 1;
        for (const reminder of reminders) {
            strArr.push(`${index++}. ${this._reminderToString(reminder)}`);
        }
        this.bot.client.send(event.channelId, strArr.join("\n"));
    }
    cancel_reminder(event) {
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
        if (actualIndex < 0) {
            throw new Error("Reminder not found in database");
        }
        this._reminders.splice(actualIndex, 1);
        this.bot.client.send(event.channelId, "Reminder **" + reminder.title + "** from " +
            (0, mention_js_1.default)(reminder.setterUserId) + "was canceled.");
    }
    _parseTimeStr(timeStr, relativeNow) {
        let match;
        if (match = timeStr.match(RELATIVE_TIME_STR_REGEX)) {
            const value = parseFloat(match[1]);
            const unit = match[2];
            if (!unit || !(unit in this._timeUnits)) {
                throw new Error("Unknown time unit");
            }
            return relativeNow + value * this._timeUnits[unit];
        }
        else if (match = timeStr.match(ABSOLUTE_TIME_STR_REGEX)) {
            const date = new Date(relativeNow);
            date.setHours(parseInt(match[1]) + (match[8]?.toLowerCase() === 'p' ? 12 : 0));
            date.setMinutes(parseInt(match[2]));
            date.setSeconds(parseInt(match[4]) || 0);
            date.setMilliseconds(parseInt(match[6]?.padEnd(3, '0')) || 0);
            if (date.getTime() <= relativeNow) {
                date.setDate(date.getDate() + 1);
            }
            return date.getTime();
        }
        else {
            const date = new Date(timeStr).getTime();
            if (isNaN(date)) {
                throw new Error("Invalid time");
            }
            return date;
        }
    }
    _addReminder(reminder) {
        if (this._reminders.length >= 1e4) {
            throw new Error("Too many reminders scheduled");
        }
        this._reminders.push(reminder);
        this._reminders.sort((a, b) => a.targetTime - b.targetTime);
        this._updateReminders();
    }
    _getChannelReminders(channelId) {
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
        if (!nextReminder) {
            return;
        }
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
    _sendReminder(reminder) {
        const index = this._reminders.indexOf(reminder);
        if (index < 0) {
            logger_js_1.default.error("Tried to send reminder not in this._reminders");
            return;
        }
        this._reminders.splice(index, 1);
        this.bot.client.send(reminder.channelId, `Reminder: **${reminder.title}**\nSet on ${new Date(reminder.setTime).toLocaleString()} by ${(0, mention_js_1.default)(reminder.setterUserId)}`);
        if (reminder.repeat && reminder.interval) {
            reminder.targetTime += reminder.interval[0];
            this._addReminder(reminder); // note: calls _updateReminders
        }
        else {
            this._updateReminders();
        }
    }
    _getMessageLink(event) {
        return `https://discord.com/channels/${event.serverId || "@me"}/${event.channelId}/${event.messageId}`;
    }
    _reminderToString(reminder) {
        console.log(reminder);
        return `${new Date(reminder.targetTime).toLocaleString()}` +
            (reminder.repeat ? ` (repeating ${reminder.interval?.map(milli => milli / 1000 + "s").join(", ")})` : "") +
            `: **${reminder.title}**`;
    }
    _start() {
        if (this._reminders.length > 0) {
            if (this.bot.client.isReady()) {
                this._updateReminders();
            }
            else {
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
    _stop() {
        this._stopReminderTimeout();
    }
}
exports.default = Reminders;
