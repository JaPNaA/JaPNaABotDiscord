import BotPlugin from "../plugin.js";
import BotHooks from "../bot/botHooks.js";
import { DiscordCommandEvent, DiscordMessageEvent } from "../events.js";
/**
 * @typedef {import("../events.js").DiscordMessageEvent} DiscordMessageEvent
 * @typedef {import("../bot/botHooks.js")} BotHooks
 */
/**
 * The weirder side of JaPNaABot
 */
declare class Game extends BotPlugin {
    constructor(bot: BotHooks);
    gPrecommandHandler(event: DiscordMessageEvent): void;
    game(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    _start(): void;
}
export default Game;
