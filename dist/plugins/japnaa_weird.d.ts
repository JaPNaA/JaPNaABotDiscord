import BotHooks from "../main/bot/bot/botHooks.js";
import DiscordMessageEvent from "../main/bot/events/discordMessageEvent";
import BotPlugin from "../main/bot/plugin/plugin.js";
/**
 * The weirder side of JaPNaABot
 */
declare class JapnaaWeird extends BotPlugin {
    lolRegexp: RegExp;
    constructor(bot: BotHooks);
    /**
     * Tetris is a racing game.
     */
    tetris(bot: BotHooks, event: DiscordMessageEvent, args: string): void;
    /**
     * JaP is kewl
     */
    jap(bot: BotHooks, event: DiscordMessageEvent, args: string): void;
    /**
     * ebola your parabola
     */
    your(bot: BotHooks, event: DiscordMessageEvent): void;
    /**
     * Listens for messages with 'lol' and deviations
     */
    onmessageHandler_lol(bot: BotHooks, event: DiscordMessageEvent): void;
    _start(): void;
    _stop(): void;
}
export default JapnaaWeird;
