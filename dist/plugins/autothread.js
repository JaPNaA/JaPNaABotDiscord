"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_js_1 = __importDefault(require("../main/bot/plugin/plugin.js"));
const commandOptions_js_1 = __importDefault(require("../main/bot/command/commandOptions.js"));
const commandHelp_js_1 = __importDefault(require("../main/bot/command/commandHelp.js"));
const ellipsisize_js_1 = __importDefault(require("../main/utils/str/ellipsisize.js"));
/**
 * Autothread plugin; automatically makes threads
 */
class AutoThread extends plugin_js_1.default {
    userConfigSchema = {
        enabled: {
            type: "boolean",
            comment: "Automatically create threads and other side effects?",
            default: false
        },
        cooldownTime: {
            type: "number",
            comment: "How many seconds until another thread is created?",
            default: 30
        },
        disableChatCooldown: {
            type: "boolean",
            comment: "Automatically disable chatting while on cooldown?",
            default: true
        }
    };
    cooldowns = new Map();
    constructor(bot) {
        super(bot);
        this.pluginName = "autothread";
    }
    async toggleAutothread(event) {
        const channel = await this.bot.client.getChannel(event.channelId);
        if (!channel || channel.isThread()) {
            this.bot.client.send(event.channelId, "Cannot create threads inside threads.");
            return;
        }
        const isEnabled = await this.config.getInChannel(event.channelId, "enabled");
        if (isEnabled) {
            this.config.setInChannel(event.channelId, "enabled", false);
            this.bot.client.send(event.channelId, "Autothread disabled.");
        }
        else {
            this.config.setInChannel(event.channelId, "enabled", true);
            this.bot.client.send(event.channelId, "Autothread enabled.");
        }
    }
    async messageHandler(event) {
        const config = await this.config.getAllUserSettingsInChannel(event.channelId);
        if (!config.get("enabled")) {
            return;
        }
        if (!(await this._isNaturalMessage(event))) {
            return;
        }
        const channel = await this.bot.client.getChannel(event.channelId);
        if (!channel || channel.isThread()) {
            return;
        }
        if (!this.isCool(event.channelId)) {
            return;
        }
        const cooldownTime = config.get("cooldownTime") * 1000;
        const disableChatCooldown = config.get("disableChatCooldown");
        channel.threads.create({
            name: (0, ellipsisize_js_1.default)(event.message || "Untitled", 100),
            startMessage: event.messageId
        });
        this.setCooldown(event.channelId, cooldownTime);
        if (disableChatCooldown) {
            // prevent people from sending messages while on cooldown
            channel.permissionOverwrites.create(channel.guild.roles.everyone, { SEND_MESSAGES: false });
            setTimeout(() => {
                channel.permissionOverwrites.delete(channel.guild.roles.everyone);
            }, cooldownTime);
        }
    }
    threadTitleFromMessage(message) {
        const firstLine = message.split("\n").find(e => e.trim());
        if (!firstLine) {
            return;
        }
    }
    async _isNaturalMessage(event) {
        const user = await this.bot.client.getUser(event.userId);
        return Boolean(!event.precommandName && // is not a command
            user && !user.bot);
    }
    isCool(channelId) {
        const cooldown = this.cooldowns.get(channelId);
        return !cooldown || cooldown <= Date.now();
    }
    setCooldown(channelId, time) {
        this.cooldowns.set(channelId, Date.now() + time);
    }
    _start() {
        this._registerDefaultCommand("autothread", this.toggleAutothread, new commandOptions_js_1.default({
            group: "Communication",
            help: new commandHelp_js_1.default({
                description: "Enables autothread (making threads) for the channel.",
                examples: [
                    ["autothread", "Toggles autothread on the channel"]
                ]
            }),
            noDM: true
        }));
        this._registerEventHandler("message", this.messageHandler);
    }
    _stop() { }
}
exports.default = AutoThread;
