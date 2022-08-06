import DiscordMessageEvent from "../main/bot/events/discordMessageEvent";
import BotPlugin from "../main/bot/plugin/plugin.js";
import Bot from "../main/bot/bot/bot";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent";
import { EventControls } from "../main/bot/events/eventHandlers";
/**
 * The weirder side of JaPNaABot
 */
declare class JapnaaWeird extends BotPlugin {
    lolRegexp: RegExp;
    l$wlRegexp: RegExp;
    constructor(bot: Bot);
    /**
     * Tetris is a racing game.
     */
    tetris(event: DiscordCommandEvent): void;
    /**
     * JaP is kewl
     */
    jap(event: DiscordCommandEvent): void;
    /**
     * ebola your parabola
     */
    your(event: DiscordCommandEvent): void;
    what_should_i_wear(event: DiscordCommandEvent): void;
    /**
     * Listens for messages with 'lol' and deviations
     */
    onmessageHandler_lol(event: DiscordMessageEvent, eventControls: EventControls): Promise<void>;
    private _countL$wl;
    _isUserMessage(bot: Bot, event: DiscordMessageEvent): Promise<boolean>;
    _start(): void;
    _stop(): void;
}
export default JapnaaWeird;
