import { TextChannel, VoiceChannel, VoiceState } from "discord.js";
import Bot from "../main/bot/bot/bot.js";
import BotCommandHelp from "../main/bot/command/commandHelp.js";
import BotCommandOptions from "../main/bot/command/commandOptions.js";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent.js";

import BotPlugin from "../main/bot/plugin/plugin.js";
import { getSnowflakeNum, stringToArgs } from "../main/utils/allUtils.js";
import Logger from "../main/utils/logger.js";
import mention from "../main/utils/str/mention.js";

/**
 * Autothread plugin; automatically makes threads
 */
export default class AnnounceVCJoin extends BotPlugin {
    public userConfigSchema = {
        enabled: {
            type: "boolean",
            comment: "Enable announce VC join for this voice channel?",
            default: false
        },
        delay: {
            type: "number",
            comment: "Seconds to wait to check if someone didn't accidentally join.",
            default: 5
        },
        announceCooldown: {
            type: "number",
            comment: "How many seconds to wait until another announce",
            default: 10 * 60
        },
        announceIn: {
            type: "string",
            comment: "Channel to announce joining in",
            default: ""
        },
        makeThread: {
            type: "boolean",
            comment: "Should the message should actually be a thread?",
            default: false
        },
    };

    private cooldowns: Map<string, number> = new Map();
    private channelsInDelay: Set<string> = new Set();
    private _voiceStateUpdateHandler?: any;

    constructor(bot: Bot) {
        super(bot);
        this.pluginName = "announceVCJoin";
    }

    public async command_announce_vc_join(event: DiscordCommandEvent) {
        const [voiceChannelStr, announceChannelStr] = stringToArgs(event.arguments);
        const voiceChannelId = getSnowflakeNum(voiceChannelStr);
        if (!voiceChannelId) { throw new Error("Invalid arguments"); }
        const voiceChannel = await this.bot.client.getChannel(voiceChannelId);
        if (!(voiceChannel instanceof VoiceChannel)) { throw new Error("Voice channel not found, or is not a voice channel"); }

        if (announceChannelStr) {
            const announceChannelId = getSnowflakeNum(announceChannelStr);
            if (!announceChannelId) { throw new Error("Invalid arguments"); }
            const announceChannel = await this.bot.client.getChannel(announceChannelId);
            if (!announceChannel) { throw new Error("Text channel not found."); }
            if (!announceChannel.isText()) { throw new Error("Text channel is not a text channel"); }

            this.config.setInChannel(voiceChannelId, "enabled", true);
            this.config.setInChannel(voiceChannelId, "announceIn", announceChannelId);
            this.bot.client.send(event.channelId, "Announcing joins for <#" + voiceChannelId + "> to <#" + announceChannelId + ">");
        } else {
            const currentlyEnabled = await this.config.getInChannel(voiceChannelId, "enabled");
            if (currentlyEnabled) {
                this.config.setInChannel(voiceChannelId, "enabled", false);
                this.bot.client.send(event.channelId, "Disabled announcing for <#" + voiceChannelId + ">");
            } else {
                const existingAnnounceIn = await this.config.getInChannel(voiceChannelId, "announceIn");
                if (existingAnnounceIn) {
                    this.config.setInChannel(voiceChannelId, "enabled", true);
                    this.bot.client.send(event.channelId, "Announcing joins for <#" + voiceChannelId + "> to <#" + existingAnnounceIn + ">");
                } else {
                    this.bot.client.send(event.channelId, "Missing channel to announce to");
                }
            }
        }

    }

    private async _onVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
        const channelId = newState.channelId;
        if (!channelId) { return; } // ignore leave channel

        const config = await this.config.getAllUserSettingsInChannel(channelId);
        const announceInChannelId = config.get("announceIn");
        if (!config.get("enabled") || !announceInChannelId) { return; } // ignore if not enabled

        const channel = await this.bot.client.getChannel(channelId);
        if (!(channel instanceof VoiceChannel)) { return; } // ignore if current channel is not voice

        const coolBy = this.cooldowns.get(channelId);
        if (coolBy && Date.now() < coolBy) { return; } // ignore if a message announcing this channel was sent recently

        if (channel.members.size !== 1) { return; }  // first person to join

        if (this.channelsInDelay.has(channelId)) { return; } // cancel if channel is already waiting for delay
        this.channelsInDelay.add(channelId);
        await this._wait(config.get("delay") * 1000); // check still in after delay
        this.channelsInDelay.delete(channelId);

        if (channel.members.size <= 0) { return; } // person left

        const announceInChannel = await this.bot.client.getChannel(announceInChannelId) as TextChannel;
        if (!announceInChannel?.isText()) { return; }

        if (config.get("makeThread") && !announceInChannel.isThread()) {
            const thread = await announceInChannel.threads.create({
                name: `call in ${channel.name} at ${this._getNowFormatted()}`
            });
            if (newState.member) {
                thread.send("Call started by " + mention(newState.member.user.id) + " in <#" + channelId + ">");
            }
        } else {
            this.bot.client.send(
                announceInChannelId,
                `${newState.member?.displayName} joined <#${channelId}>`
            );
        }

        this.cooldowns.set(channelId, Date.now() + config.get("announceCooldown") * 1000);
    }

    private _wait(ms: number): Promise<void> {
        return new Promise(res => setTimeout(() => res(), ms));
    }

    private _getNowFormatted() {
        const now = new Date();
        return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`
    }

    _start(): void {
        this.bot.client.client.on("voiceStateUpdate",
            this._voiceStateUpdateHandler = (oldState: VoiceState, newState: VoiceState) => {
                this._onVoiceStateUpdate(oldState, newState)
                    .catch(err => Logger.error(err));
            });

        this._registerDefaultCommand("announce vc join", this.command_announce_vc_join, new BotCommandOptions({
            group: "Communication",
            help: new BotCommandHelp({
                description: "Tell the bot start/stop sending announcements when someone starts a call in a voice channel",
                overloads: [{
                    "voiceChannel": "Id or mention to the voice channel for the bot to watch",
                    "[textChannel]": "Optional. The text channel for the bot to announce in. Required to enable for the first time. If not provided, toggles between enabling and disabling announcements."
                }],
                examples: [
                    ["announce vc join 937157681297391656 877304170653319198", "The bot will start announcing when someone joins <#937157681297391656> into the channel <#877304170653319198>"],
                    ["announce vc join 937157681297391656", "The bot will toggle announcements for the voice channel <#937157681297391656>"]
                ]

            })
        }));
    }

    _stop() {
        this.bot.client.client.off("voiceStateUpdate", this._voiceStateUpdateHandler);
    }
}