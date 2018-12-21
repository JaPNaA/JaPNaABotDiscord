import BotPlugin from "../plugin.js";
import BotHooks from "../bot/botHooks.js";
/**
 * @typedef {import("../events.js").DiscordMessageEvent} DiscordMessageEvent
 * @typedef {import("../bot/botHooks.js")} BotHooks
 */
/**
 * The weirder side of JaPNaABot
 */
declare class Game extends BotPlugin {
    constructor(bot: BotHooks);
    gPrecommandHandler(): void;
    game(): void;
    _start(): void;
}
export default Game;
