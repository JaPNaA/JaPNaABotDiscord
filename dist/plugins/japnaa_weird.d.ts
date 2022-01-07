import DiscordMessageEvent from "../main/bot/events/discordMessageEvent";
import BotPlugin from "../main/bot/plugin/plugin.js";
import Bot from "../main/bot/bot/bot";
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
    tetris(bot: Bot, event: DiscordMessageEvent, args: string): void;
    /**
     * JaP is kewl
     */
    jap(bot: Bot, event: DiscordMessageEvent, args: string): void;
    /**
     * ebola your parabola
     */
    your(bot: Bot, event: DiscordMessageEvent): void;
    /**
     * Listens for messages with 'lol' and deviations
     */
    onmessageHandler_lol(bot: Bot, event: DiscordMessageEvent): Promise<void>;
    _countL$wl(str: string): number;
    _isNaturalMessage(bot: Bot, event: DiscordMessageEvent): Promise<boolean>;
    _start(): void;
    _stop(): void;
}
export default JapnaaWeird;
