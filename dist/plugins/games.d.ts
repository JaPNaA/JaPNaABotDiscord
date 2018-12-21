import BotPlugin from "../main/plugin.js";
import BotHooks from "../main/bot/botHooks.js";
import { DiscordCommandEvent, DiscordMessageEvent } from "../main/events.js";
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
