"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
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
            comment: "Should create a thread with the announcement message?",
            default: false
        },
        endCallThreadBehavior: {
            type: "string",
            comment: 'What should happen to a thread (if made) after call ends? ("archive", "1hrArchive", "none")',
            default: "1hrArchive"
        },
        deleteLonelyCalls: {
            type: "boolean",
            comment: "If only one person was in the call, should delete message after call ends?",
            default: false
        }
    };
    channelStates = new Map();
    _voiceStateUpdateHandler;
    constructor(bot) {
        super(bot);
        this.pluginName = "announceVCJoin";
    }
    async *command_announce_vc_join(event) {
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
            return "Announcing joins for <#" + voiceChannelId + "> to <#" + announceChannelId + ">";
        }
        else {
            const currentlyEnabled = await this.config.getInChannel(voiceChannelId, "enabled");
            if (currentlyEnabled) {
                this.config.setInChannel(voiceChannelId, "enabled", false);
                return "Disabled announcing for <#" + voiceChannelId + ">";
            }
            else {
                const existingAnnounceIn = await this.config.getInChannel(voiceChannelId, "announceIn");
                if (existingAnnounceIn) {
                    this.config.setInChannel(voiceChannelId, "enabled", true);
                    return "Announcing joins for <#" + voiceChannelId + "> to <#" + existingAnnounceIn + ">";
                }
                else {
                    return "Missing channel to announce to";
                }
            }
        }
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
        const announceInChannelId = config.get("announceIn");
        if (!config.get("enabled") || !announceInChannelId) {
            return;
        } // ignore if not enabled
        const channel = await this.bot.client.getChannel(channelId);
        if (!(channel instanceof discord_js_1.VoiceChannel)) {
            return;
        } // ignore if current channel is not voice
        const channelState = this.channelStates.get(channelId) || {};
        this.channelStates.set(channelId, channelState); // case where empty
        // add member to call thread, if active
        if (channelState.thread && !channelState.thread.archived && channelState.threadMessage && state.member) {
            channelState.threadMessage.addParticipantAndUpdateMessage(state.member);
        }
        if (channel.members.size > 1) {
            channelState.wasNotLonelyCall = true;
        }
        if (channel.members.size !== 1) {
            return;
        } // first person to join
        if (channelState.isWaitingForDelay) {
            return;
        } // cancel if channel is already waiting for delay
        channelState.isWaitingForDelay = true;
        await this._wait(config.get("delay") * 1000); // check still in after delay
        channelState.isWaitingForDelay = false;
        if (channel.members.size <= 0) {
            return;
        } // person left
        const announceInChannel = await this.bot.client.getChannel(announceInChannelId);
        if (!announceInChannel?.isText()) {
            return;
        }
        // ignore if a message announcing this channel was sent recently
        // if was thread, unarchive and add participant
        if (channelState.cooldownBy && Date.now() < channelState.cooldownBy) {
            if (channelState.thread) {
                channelState.thread.setArchived(false);
                // restore previous autoArchiveDuration if changed
                if (channelState.prevArchiveDelay &&
                    config.get("endCallThreadBehavior") === "1hrArchive") {
                    channelState.thread.setAutoArchiveDuration(channelState.prevArchiveDelay);
                }
                if (channelState.threadMessage && state.member) {
                    channelState.threadMessage.addParticipantAndUpdateMessage(state.member);
                }
            }
            return;
        }
        // anounce call start
        // Always send announcement message, even if creating thread
        // Discord doesn't send (mobile) notifications for thread creation
        channelState.thread = undefined;
        channelState.announcementMessage = (0, allUtils_js_1.toOne)(await this.bot.client.send(announceInChannelId, {
            allowedMentions: { users: [] },
            content: `${state.member && (0, mention_js_1.default)(state.member?.id)} joined <#${channelId}>`
        }));
        if (config.get("makeThread") && !announceInChannel.isThread()) {
            const thread = await announceInChannel.threads.create({
                name: `call in ${channel.name} at ${this._getNowFormatted()}`,
                startMessage: channelState.announcementMessage
            });
            channelState.thread = thread;
            channelState.threadMessage = new CallThreadMessage(channelId, thread, state.member);
            channelState.threadMessage.sendIfNotAlready();
            if (state.channel) {
                for (const member of state.channel.members) {
                    channelState.threadMessage.addParticipantAndUpdateMessage(member[1]);
                }
            }
        }
        channelState.wasNotLonelyCall = channel.members.size > 1;
        channelState.cooldownBy = Date.now() + config.get("announceCooldown") * 1000;
    }
    async _onVCLeave(state) {
        const channelId = state.channelId;
        if (!channelId) {
            return;
        } // if channelId is undefined (shouldn't happen)
        const config = await this.config.getAllUserSettingsInChannel(channelId);
        const channel = await this.bot.client.getChannel(channelId);
        if (!(channel instanceof discord_js_1.VoiceChannel)) {
            return;
        } // ignore if current channel is not voice
        if (channel.members.size > 0) {
            return;
        } // not everyone left
        const channelState = this.channelStates.get(channelId) || {};
        // delete lonely calls
        if (!channelState.wasNotLonelyCall && config.get("deleteLonelyCalls")) {
            if (channelState.thread) {
                // don't delete thread if messages sent in thread
                // 1st message: starter message; 2nd message: CallThreadMessage (participants message)
                if (channelState.thread.messages.cache.size <= 2) {
                    // delete announcement message too
                    if (channelState.announcementMessage) {
                        await channelState.announcementMessage.delete();
                        channelState.announcementMessage = undefined;
                    }
                    await channelState.thread.delete("Lonely call");
                    channelState.thread = undefined;
                }
            }
            else if (channelState.announcementMessage) {
                await channelState.announcementMessage.delete();
                channelState.announcementMessage = undefined;
            }
        }
        // archive thread
        if (channelState.thread) {
            const endCallThreadBehavior = config.get("endCallThreadBehavior");
            channelState.prevArchiveDelay = (channelState.thread.autoArchiveDuration || 60 * 24);
            if (endCallThreadBehavior === "archive") {
                channelState.thread.setArchived();
            }
            else if (endCallThreadBehavior === "1hrArchive") {
                channelState.thread.setAutoArchiveDuration(60);
            }
        }
        channelState.cooldownBy = Date.now() + config.get("announceCooldown") * 1000;
    }
    async _deleteMessageInChannel(channelId, messageId) {
        if (!channelId) {
            return;
        }
        const channel = await this.bot.client.getChannel(channelId);
        if (!channel?.isText()) {
            return;
        }
        const message = await channel.messages.fetch(messageId);
        if (!message || !message.deletable) {
            return;
        }
        await message.delete();
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
        this._registerDefaultCommand("announce vc join", this.command_announce_vc_join, {
            group: "Communication",
            help: {
                description: "Tell the bot start/stop sending announcements when someone starts a call in a voice channel",
                overloads: [{
                        "voiceChannel": "Id or mention to the voice channel for the bot to watch",
                        "[textChannel]": "Optional. The text channel for the bot to announce in. Required to enable for the first time. If not provided, toggles between enabling and disabling announcements."
                    }],
                examples: [
                    ["announce vc join 937157681297391656 877304170653319198", "The bot will start announcing when someone joins <#937157681297391656> into the channel <#877304170653319198>"],
                    ["announce vc join 937157681297391656", "The bot will toggle announcements for the voice channel <#937157681297391656>"]
                ]
            }
        });
    }
    _stop() {
        this.bot.client.client.off("voiceStateUpdate", this._voiceStateUpdateHandler);
    }
}
exports.default = AnnounceVCJoin;
class CallThreadMessage {
    voiceChannelId;
    thread;
    starter;
    messagePromise;
    additionalParticipants = [];
    constructor(voiceChannelId, thread, starter) {
        this.voiceChannelId = voiceChannelId;
        this.thread = thread;
        this.starter = starter;
    }
    async sendIfNotAlready() {
        if (this.messagePromise) {
            return;
        }
        if (this.starter) {
            this.messagePromise = this.thread.send("Adding you to the thread...");
            const message = await this.messagePromise;
            await message.edit((0, mention_js_1.default)(this.starter.id));
            await message.edit(this.generateMessageStr());
        }
    }
    async addParticipantAndUpdateMessage(participant) {
        if (this.starter && participant.id === this.starter.id) {
            return;
        }
        if (this.additionalParticipants.find(p => p.id == participant.id)) {
            return;
        }
        this.additionalParticipants.push(participant);
        await this.sendIfNotAlready();
        (await this.messagePromise).edit(this.generateMessageStr());
    }
    generateMessageStr() {
        if (this.additionalParticipants.length > 0) {
            return "Participants: " + this.additionalParticipants.map(p => (0, mention_js_1.default)(p.id)).join(", ");
        }
        else {
            return "No participants yet...";
        }
    }
}
