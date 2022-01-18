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
    activeChannels;
    cooldowns = new Map();
    constructor(bot) {
        super(bot);
        this._pluginName = "autothread";
        this.activeChannels = bot.memory.get(this._pluginName, "activeChannels") || [];
    }
    async toggleAutothread(event) {
        const existingIndex = this.activeChannels.indexOf(event.channelId);
        const channel = await this.bot.client.getChannel(event.channelId);
        if (!channel || channel.isThread()) {
            this.bot.client.send(event.channelId, "Cannot create threads inside threads.");
            return;
        }
        if (existingIndex < 0) {
            this.activeChannels.push(event.channelId);
            this.bot.client.send(event.channelId, "Autothread enabled.");
        }
        else {
            this.activeChannels.splice(existingIndex, 1);
            this.bot.client.send(event.channelId, "Autothread disabled.");
        }
        this.writeToMemory();
    }
    async messageHandler(event) {
        if (!this.activeChannels.includes(event.channelId)) {
            return;
        }
        if (!(await this._isNaturalMessage(event))) {
            return;
        }
        const channel = await this.bot.client.getChannel(event.channelId);
        if (!channel) {
            return;
        }
        if (!this.isCool(event.channelId)) {
            return;
        }
        channel.threads.create({
            name: (0, ellipsisize_js_1.default)(event.message || "Untitled", 100),
            startMessage: event.messageId
        });
        this.setCooldown(event.channelId);
        // temporary: prevent people from sending messages while on cooldown
        channel.permissionOverwrites.create(channel.guild.roles.everyone, { SEND_MESSAGES: false });
        setTimeout(() => {
            channel.permissionOverwrites.delete(channel.guild.roles.everyone);
        }, 30e3);
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
    setCooldown(channelId) {
        this.cooldowns.set(channelId, Date.now() + 30e3);
    }
    writeToMemory() {
        this.bot.memory.write(this._pluginName, "activeChannels", this.activeChannels);
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
