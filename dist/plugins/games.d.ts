import BotPlugin from "../main/bot/plugin/plugin.js";
import BotHooks from "../main/bot/botHooks.js";
import { DiscordCommandEvent, DiscordMessageEvent } from "../main/events.js";
import { PrecommandWithoutCallback } from "../main/bot/precommand/precommand.js";
import Game from "./games/game.js";
/**
 * Games!
 */
declare class Games extends BotPlugin {
    precommand: PrecommandWithoutCallback;
    currentGame?: Game;
    constructor(bot: BotHooks);
    gPrecommandHandler(event: DiscordMessageEvent): void;
    game(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    _start(): void;
    _stop(): void;
}
export default Games;
