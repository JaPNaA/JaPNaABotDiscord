import BotHooks from "../bot/botHooks.js";
import { DiscordMessageEvent } from "../events.js";
import BotPlugin from "../plugin.js";
/**
 * The weirder side of JaPNaABot
 */
declare class JapnaaWeird extends BotPlugin {
    lolRegexp: RegExp;
    constructor(bot: BotHooks);
    /**
     * Tetris is a racing game.
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args What type of game is Tetris?
     */
    tetris(bot: BotHooks, event: DiscordMessageEvent, args: string): void;
    /**
     * JaP is kewl
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args What is JaP?
     */
    jap(bot: BotHooks, event: DiscordMessageEvent, args: string): void;
    /**
     * ebola your parabola
     * @param {BotHooks} bot
     * @param {DiscordMessageEvent} event message event
     */
    your(bot: BotHooks, event: DiscordMessageEvent): void;
    /**
     * Listens for messages with 'lol' and deviations
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     */
    onmessageHandler_lol(bot: BotHooks, event: DiscordMessageEvent): void;
    _start(): void;
}
export default JapnaaWeird;
