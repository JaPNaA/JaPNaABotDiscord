import Bot from "../main/bot/bot/bot.js";
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
        makeThread: {
            type: string;
            comment: string;
            default: boolean;
        };
        delay: {
            type: string;
            comment: string;
            default: number;
        };
        announceIn: {
            type: string;
            comment: string;
            default: string;
        };
    };
    constructor(bot: Bot);
    private _onVoiceStateUpdate;
    _start(): void;
    _stop(): void;
}
