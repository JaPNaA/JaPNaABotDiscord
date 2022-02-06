import Bot from "../main/bot/bot/bot.js";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent.js";
import BotPlugin from "../main/bot/plugin/plugin.js";
/**
 * Autothread plugin; automatically makes threads
 */
export default class AnnounceVCJoin extends BotPlugin {
    userConfigSchema: {
        enabled: {
            type: string;
            comment: string;
            default: boolean;
        };
        delay: {
            type: string;
            comment: string;
            default: number;
        };
        announceCooldown: {
            type: string;
            comment: string;
            default: number;
        };
        announceIn: {
            type: string;
            comment: string;
            default: string;
        };
        makeThread: {
            type: string;
            comment: string;
            default: boolean;
        };
        endCallThreadBehavior: {
            type: string;
            comment: string;
            default: string;
        };
    };
    private channelStates;
    private _voiceStateUpdateHandler?;
    constructor(bot: Bot);
    command_announce_vc_join(event: DiscordCommandEvent): Promise<void>;
    private _onVoiceStateUpdate;
    /**
     * Preconditions:
     *   - state is newState, and a member joined (state.channelId is defined)
     */
    private _onVCJoin;
    private _onVCLeave;
    private _wait;
    private _getNowFormatted;
    _start(): void;
    _stop(): void;
}