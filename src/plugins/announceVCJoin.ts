import { TextChannel, VoiceChannel, VoiceState } from "discord.js";
import Bot from "../main/bot/bot/bot.js";

import BotPlugin from "../main/bot/plugin/plugin.js";

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
        makeThread: {
            type: "boolean",
            comment: "Should the message should actually be a thread?",
            default: false
        },
        delay: {
            type: "number",
            comment: "Milliseconds to wait to check if someone didn't accidentally join.",
            default: 5e3
        },
        announceIn: {
            type: "string",
            comment: "Channel to announce joining in",
            default: ""
        }
    };

    constructor(bot: Bot) {
        super(bot);
        this.pluginName = "announceVCJoin";
    }

    private async _onVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
        const channelId = newState.channelId;
        if (!channelId) { return; }

        const config = await this.config.getAllUserSettingsInChannel(channelId);
        const announceInChannelId = config.get("announceIn");
        if (!config.get("enabled") || !announceInChannelId) { return; }
        const channel = await this.bot.client.getChannel(channelId);
        if (!(channel instanceof VoiceChannel)) { return; }

        if (channel.members.size === 1) {
            setTimeout(async () => {
                if (channel.members.size >= 1) {
                    const message = `${newState.member?.nickname} joined <#${channelId}>`;
                    if (config.get("makeThread")) {
                        const announceInChannel = await this.bot.client.getChannel(announceInChannelId) as TextChannel;
                        if (!announceInChannel?.isText()) { return; }

                        announceInChannel.threads.create({
                            name: message
                        });
                    } else {
                        this.bot.client.send(
                            announceInChannelId,
                            `${newState.member?.nickname} joined <#${channelId}>`
                        );
                    }
                }
            }, this.config.get("delay"));
        }
    }

    _start(): void {
        this.bot.client.client.on("voiceStateUpdate", (oldState, newState) => {
            this._onVoiceStateUpdate(oldState, newState);
        });
    }

    _stop() { }
}