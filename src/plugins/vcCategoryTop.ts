import { CategoryChannel, ChannelSelectMenuInteraction, VoiceChannel, VoiceState } from "discord.js";
import Bot from "../main/bot/bot/bot";
import BotPlugin from "../main/bot/plugin/plugin";
import Logger from "../main/utils/logger";

export default class VCCategoryTop extends BotPlugin {
    private _voiceStateUpdateHandler?: any;

    public userConfigSchema: { [x: string]: { type: string; comment: string; default: any; }; } = {
        enabled: {
            comment: "Enable this plugin?",
            default: false,
            type: "boolean"
        }
    };

    private parentChannelStates: Map<string, {
        originalPosition: number,
        channelsActive: Set<string>
    }> = new Map();

    private serverStates: Map<string, {
        toppedCategory?: string
    }> = new Map();

    constructor(bot: Bot) {
        super(bot);
        this.pluginName = "vcCategoryTop";
    }

    private async _onVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
        if (oldState.channelId === newState.channelId) { return; } // no change
        if (newState.channelId) {
            this._onVCJoin(newState);
        }
        if (oldState.channelId) {
            this._onVCLeave(oldState);
        }
    }

    /**
     * Preconditions:
     *   - state is newState, and a member joined (state.channelId is defined)
     */
    private async _onVCJoin(state: VoiceState) {
        const channelId = state.channelId!;
        const config = await this.config.getAllUserSettingsInChannel(channelId);

        if (!config.get("enabled")) { return; } // ignore if not enabled

        const channel = await this.bot.client.getChannel(channelId);
        if (!(channel instanceof VoiceChannel)) { return; } // ignore if current channel is not voice

        const parent = channel.parent;
        if (!parent) { return; }

        const serverState = this.serverStates.get(parent.guildId) || {
            toppedCategory: parent.id
        };
        this.serverStates.set(parent.guildId, serverState);
        if (serverState.toppedCategory && serverState.toppedCategory !== parent.id) {
            return; // topping more than two categories not implemented
        }

        const channelState = this.parentChannelStates.get(parent.id) || {
            originalPosition: 0,
            channelsActive: new Set()
        };
        this.parentChannelStates.set(parent.id, channelState); // case where empty

        let isNewTop = false;
        if (channelState.channelsActive.size === 0) {
            channelState.originalPosition = parent.position;
            isNewTop = true;
        }

        channelState.channelsActive.add(channelId);

        if (isNewTop) {
            await parent.setPosition(0);
        }
    }

    private async _onVCLeave(state: VoiceState) {
        const channelId = state.channelId;
        if (!channelId) { return; } // if channelId is undefined (shouldn't happen)

        const config = await this.config.getAllUserSettingsInChannel(channelId);
        if (!config.get("enabled")) { return; }

        const channel = await this.bot.client.getChannel(channelId);
        if (!(channel instanceof VoiceChannel)) { return; } // ignore if current channel is not voice

        if (channel.members.size > 0) { return; } // not everyone left

        const parent = channel.parent;
        if (!parent) { return; }

        const channelState = this.parentChannelStates.get(parent.id);
        if (!channelState) { return; }

        channelState.channelsActive.delete(channelId);
        if (channelState.channelsActive.size > 0) { return; }

        const serverState = this.serverStates.get(parent.guildId);
        if (serverState) { serverState.toppedCategory = undefined; }

        await parent.setPosition(channelState.originalPosition);
    }

    public _start(): void {
        this.bot.client.client.on("voiceStateUpdate",
            this._voiceStateUpdateHandler = (oldState: VoiceState, newState: VoiceState) => {
                this._onVoiceStateUpdate(oldState, newState)
                    .catch(err => Logger.error(err));
            });
    }

    public async _stop(): Promise<void> {
        this.bot.client.client.off("voiceStateUpdate", this._voiceStateUpdateHandler);

        const promises: Promise<void>[] = [];

        for (const [_, serverState] of this.serverStates) {
            const parentId = serverState.toppedCategory;
            if (parentId) {
                const channelState = this.parentChannelStates.get(parentId);
                if (channelState && channelState.channelsActive.size > 0) {
                    promises.push((async () => {
                        const parent = await this.bot.client.getChannel(parentId) as CategoryChannel;
                        await parent.setPosition(channelState.originalPosition);
                    })());
                }
            }
        }

        await Promise.all(promises);
    }
}