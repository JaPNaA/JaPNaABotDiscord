import BotPlugin from "../main/bot/plugin/plugin.js";
import BotHooks from "../main/bot/botHooks.js";
import { DiscordCommandEvent, DiscordMessageEvent } from "../main/events.js";
import Precommand from "../main/bot/precommand/precommand.js";
/**
 * The weirder side of JaPNaABot
 */
declare class Game extends BotPlugin {
    precommand: Precommand;
    constructor(bot: BotHooks);
    gPrecommandHandler(event: DiscordMessageEvent): void;
    game(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    _start(): void;
}
export default Game;
