"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const commandHelp_js_1 = __importDefault(require("../main/bot/command/commandHelp.js"));
const commandOptions_js_1 = __importDefault(require("../main/bot/command/commandOptions.js"));
const plugin_js_1 = __importDefault(require("../main/bot/plugin/plugin.js"));
const allUtils_js_1 = require("../main/utils/allUtils.js");
const logger_js_1 = __importDefault(require("../main/utils/logger.js"));
const mention_js_1 = __importDefault(require("../main/utils/str/mention.js"));
/**
 * Autothread plugin; automatically makes threads
 */
class AnnounceVCJoin extends plugin_js_1.default {
    userConfigSchema = {
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
    cooldowns = new Map();
    _voiceStateUpdateHandler;
    constructor(bot) {
        super(bot);
        this.pluginName = "announceVCJoin";
    }
    async command_announce_vc_join(event) {
        const [voiceChannelStr, announceChannelStr] = (0, allUtils_js_1.stringToArgs)(event.arguments);
        const voiceChannelId = (0, allUtils_js_1.getSnowflakeNum)(voiceChannelStr);
        if (!voiceChannelId) {
            throw new Error("Invalid arguments");
        }
        const voiceChannel = await this.bot.client.getChannel(voiceChannelId);
        if (!(voiceChannel instanceof discord_js_1.VoiceChannel)) {
            throw new Error("Voice channel not found, or is not a voice channel");
        }
        if (announceChannelStr) {
            const announceChannelId = (0, allUtils_js_1.getSnowflakeNum)(announceChannelStr);
            if (!announceChannelId) {
                throw new Error("Invalid arguments");
            }
            const announceChannel = await this.bot.client.getChannel(announceChannelId);
            if (!announceChannel) {
                throw new Error("Text channel not found.");
            }
            if (!announceChannel.isText()) {
                throw new Error("Text channel is not a text channel");
            }
            this.config.setInChannel(voiceChannelId, "enabled", true);
            this.config.setInChannel(voiceChannelId, "announceIn", announceChannelId);
            this.bot.client.send(event.channelId, "Announcing joins for <#" + voiceChannelId + "> to <#" + announceChannelId + ">");
        }
        else {
            const currentlyEnabled = await this.config.getInChannel(voiceChannelId, "enabled");
            if (currentlyEnabled) {
                this.config.setInChannel(voiceChannelId, "enabled", false);
                this.bot.client.send(event.channelId, "Disabled announcing for <#" + voiceChannelId + ">");
            }
            else {
                const existingAnnounceIn = await this.config.getInChannel(voiceChannelId, "announceIn");
                if (existingAnnounceIn) {
                    this.config.setInChannel(voiceChannelId, "enabled", true);
                    this.bot.client.send(event.channelId, "Announcing joins for <#" + voiceChannelId + "> to <#" + existingAnnounceIn + ">");
                }
                else {
                    this.bot.client.send(event.channelId, "Missing channel to announce to");
                }
            }
        }
    }
    async _onVoiceStateUpdate(oldState, newState) {
        const channelId = newState.channelId;
        if (!channelId) {
            return;
        } // ignore leave channel
        const config = await this.config.getAllUserSettingsInChannel(channelId);
        const announceInChannelId = config.get("announceIn");
        if (!config.get("enabled") || !announceInChannelId) {
            return;
        } // ignore if not enabled
        const channel = await this.bot.client.getChannel(channelId);
        if (!(channel instanceof discord_js_1.VoiceChannel)) {
            return;
        } // ignore if current channel is not voice
        const coolBy = this.cooldowns.get(channelId);
        if (coolBy && Date.now() < coolBy) {
            return;
        } // ignore if a message announcing this channel was sent recently
        if (channel.members.size !== 1) {
            return;
        }
        await this._wait(config.get("delay") * 1000); // check still in after delay
        if (channel.members.size <= 0) {
            return;
        }
        const announceInChannel = await this.bot.client.getChannel(announceInChannelId);
        if (!announceInChannel?.isText()) {
            return;
        }
        if (config.get("makeThread") && !announceInChannel.isThread()) {
            const thread = await announceInChannel.threads.create({
                name: `call in ${channel.name} at ${this._getNowFormatted()}`
            });
            if (newState.member) {
                thread.send("Call started by " + (0, mention_js_1.default)(newState.member.user.id) + " in <#" + channelId + ">");
            }
        }
        else {
            this.bot.client.send(announceInChannelId, `${newState.member?.displayName} joined <#${channelId}>`);
        }
        this.cooldowns.set(channelId, Date.now() + config.get("announceCooldown") * 1000);
    }
    _wait(ms) {
        return new Promise(res => setTimeout(() => res(), ms));
    }
    _getNowFormatted() {
        const now = new Date();
        return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    }
    _start() {
        this.bot.client.client.on("voiceStateUpdate", this._voiceStateUpdateHandler = (oldState, newState) => {
            this._onVoiceStateUpdate(oldState, newState)
                .catch(err => logger_js_1.default.error(err));
        });
        this._registerDefaultCommand("announce vc join", this.command_announce_vc_join, new commandOptions_js_1.default({
            group: "Communication",
            help: new commandHelp_js_1.default({
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
exports.default = AnnounceVCJoin;
