import Bot from "../main/bot/bot/bot";
import BotPlugin from "../main/bot/plugin/plugin";
export default class VCCategoryTop extends BotPlugin {
    private _voiceStateUpdateHandler?;
    userConfigSchema: {
        [x: string]: {
            type: string;
            comment: string;
            default: any;
        };
    };
    private parentChannelStates;
    private serverStates;
    constructor(bot: Bot);
    private _onVoiceStateUpdate;
    /**
     * Preconditions:
     *   - state is newState, and a member joined (state.channelId is defined)
     */
    private _onVCJoin;
    private _onVCLeave;
    _start(): void;
    _stop(): Promise<void>;
}
