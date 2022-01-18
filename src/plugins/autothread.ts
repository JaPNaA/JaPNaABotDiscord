import Bot from "../main/bot/bot/bot.js";
import DiscordMessageEvent from "../main/bot/events/discordMessageEvent";

import BotPlugin from "../main/bot/plugin/plugin.js";
import BotCommandOptions from "../main/bot/command/commandOptions.js";
import BotCommandHelp from "../main/bot/command/commandHelp.js";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent.js";
import { TextChannel } from "discord.js";
import ellipsisize from "../main/utils/str/ellipsisize.js";

/**
 * Autothread plugin; automatically makes threads
 */
export default class AutoThread extends BotPlugin {
    private activeChannels: string[];
    private cooldowns: Map<string, number> = new Map();

    constructor(bot: Bot) {
        super(bot);
        this._pluginName = "autothread";
        this.activeChannels = bot.memory.get(this._pluginName, "activeChannels") || [];
    }

    public async toggleAutothread(event: DiscordCommandEvent) {
        const existingIndex = this.activeChannels.indexOf(event.channelId);
        const channel = await this.bot.client.getChannel(event.channelId);
        if (!channel || channel.isThread()) {
            this.bot.client.send(event.channelId, "Cannot create threads inside threads.");
            return;
        }

        if (existingIndex < 0) {
            this.activeChannels.push(event.channelId);
            this.bot.client.send(event.channelId, "Autothread enabled.");
        } else {
            this.activeChannels.splice(existingIndex, 1);
            this.bot.client.send(event.channelId, "Autothread disabled.");
        }

        this.writeToMemory();
    }

    public async messageHandler(event: DiscordMessageEvent) {
        if (!this.activeChannels.includes(event.channelId)) { return; }
        if (!(await this._isNaturalMessage(event))) { return; }
        const channel = await this.bot.client.getChannel(event.channelId) as TextChannel;
        if (!channel) { return; }

        if (!this.isCool(event.channelId)) { return; }

        channel.threads.create({
            name: ellipsisize(event.message, 100),
            startMessage: event.messageId
        });
        this.setCooldown(event.channelId);
    }

    private async _isNaturalMessage(event: DiscordMessageEvent): Promise<boolean> {
        const user = await this.bot.client.getUser(event.userId);
        return Boolean(
            !event.precommandName && // is not a command
            user && !user.bot
        );
    }

    private isCool(channelId: string): boolean {
        const cooldown = this.cooldowns.get(channelId);
        return !cooldown || cooldown <= Date.now();
    }

    private setCooldown(channelId: string) {
        this.cooldowns.set(channelId, Date.now() + 30e3);
    }

    private writeToMemory() {
        this.bot.memory.write(this._pluginName, "activeChannels", this.activeChannels);
    }

    _start(): void {
        this._registerDefaultCommand("autothread", this.toggleAutothread, new BotCommandOptions({
            group: "Communication",
            help: new BotCommandHelp({
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
