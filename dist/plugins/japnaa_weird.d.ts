import DiscordMessageEvent from "../main/bot/events/discordMessageEvent";
import BotPlugin from "../main/bot/plugin/plugin.js";
import Bot from "../main/bot/bot/bot";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent";
import { EventControls } from "../main/bot/events/eventHandlers";
import { ReplyReact } from "../main/bot/actions/actions";
/**
 * The weirder side of JaPNaABot
 */
declare class JapnaaWeird extends BotPlugin {
    lolRegexp: RegExp;
    l$wlRegexp: RegExp;
    goodBotRegexp: RegExp;
    badBotRegexp: RegExp;
    constructor(bot: Bot);
    /**
     * Tetris is a racing game.
     */
    tetris(event: DiscordCommandEvent): Generator<string, void, unknown>;
    /**
     * JaP is kewl
     */
    jap(event: DiscordCommandEvent): Generator<{
        embeds: {
            color: number;
            description: string;
        }[];
    }, void, unknown>;
    /**
     * ebola your parabola
     */
    your(): Generator<string, void, unknown>;
    what_should_i_wear(): Generator<string, void, unknown>;
    /**
     * Listens for messages with 'lol' and deviations
     */
    onmessageHandler_lol(event: DiscordMessageEvent, eventControls: EventControls): AsyncGenerator<string | ReplyReact, void, unknown>;
    private _countL$wl;
    _isUserMessage(bot: Bot, event: DiscordMessageEvent): Promise<boolean>;
    _start(): void;
    _stop(): void;
}
export default JapnaaWeird;
