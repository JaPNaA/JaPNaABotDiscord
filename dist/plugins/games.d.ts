import BotPlugin from "../main/bot/plugin/plugin.js";
import BotHooks from "../main/bot/botHooks.js";
import { DiscordCommandEvent, DiscordMessageEvent } from "../main/events.js";
import { PrecommandWithoutCallback } from "../main/bot/precommand/precommand.js";
/**
 * Games!
 */
declare class Game extends BotPlugin {
    precommand: PrecommandWithoutCallback;
    constructor(bot: BotHooks);
    gPrecommandHandler(event: DiscordMessageEvent): void;
    game(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    _start(): void;
    _stop(): void;
}
export default Game;
