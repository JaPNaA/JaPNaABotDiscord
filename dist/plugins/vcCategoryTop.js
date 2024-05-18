"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const plugin_1 = __importDefault(require("../main/bot/plugin/plugin"));
const logger_1 = __importDefault(require("../main/utils/logger"));
class VCCategoryTop extends plugin_1.default {
    _voiceStateUpdateHandler;
    userConfigSchema = {
        enabled: {
            comment: "Enable this plugin?",
            default: false,
            type: "boolean"
        }
    };
    parentChannelStates = new Map();
    serverStates = new Map();
    constructor(bot) {
        super(bot);
        this.pluginName = "vcCategoryTop";
    }
    async _onVoiceStateUpdate(oldState, newState) {
        if (oldState.channelId === newState.channelId) {
            return;
        } // no change
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
    async _onVCJoin(state) {
        const channelId = state.channelId;
        const config = await this.config.getAllUserSettingsInChannel(channelId);
        if (!config.get("enabled")) {
            return;
        } // ignore if not enabled
        const channel = await this.bot.client.getChannel(channelId);
        if (!(channel instanceof discord_js_1.VoiceChannel)) {
            return;
        } // ignore if current channel is not voice
        const parent = channel.parent;
        if (!parent) {
            return;
        }
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
    async _onVCLeave(state) {
        const channelId = state.channelId;
        if (!channelId) {
            return;
        } // if channelId is undefined (shouldn't happen)
        const config = await this.config.getAllUserSettingsInChannel(channelId);
        if (!config.get("enabled")) {
            return;
        }
        const channel = await this.bot.client.getChannel(channelId);
        if (!(channel instanceof discord_js_1.VoiceChannel)) {
            return;
        } // ignore if current channel is not voice
        if (channel.members.size > 0) {
            return;
        } // not everyone left
        const parent = channel.parent;
        if (!parent) {
            return;
        }
        const channelState = this.parentChannelStates.get(parent.id);
        if (!channelState) {
            return;
        }
        channelState.channelsActive.delete(channelId);
        if (channelState.channelsActive.size > 0) {
            return;
        }
        const serverState = this.serverStates.get(parent.guildId);
        if (serverState) {
            serverState.toppedCategory = undefined;
        }
        await parent.setPosition(channelState.originalPosition);
    }
    _start() {
        this.bot.client.client.on("voiceStateUpdate", this._voiceStateUpdateHandler = (oldState, newState) => {
            this._onVoiceStateUpdate(oldState, newState)
                .catch(err => logger_1.default.error(err));
        });
    }
    async _stop() {
        this.bot.client.client.off("voiceStateUpdate", this._voiceStateUpdateHandler);
        const promises = [];
        for (const [_, serverState] of this.serverStates) {
            const parentId = serverState.toppedCategory;
            if (parentId) {
                const channelState = this.parentChannelStates.get(parentId);
                if (channelState && channelState.channelsActive.size > 0) {
                    promises.push((async () => {
                        const parent = await this.bot.client.getChannel(parentId);
                        await parent.setPosition(channelState.originalPosition);
                    })());
                }
            }
        }
        await Promise.all(promises);
    }
}
exports.default = VCCategoryTop;
