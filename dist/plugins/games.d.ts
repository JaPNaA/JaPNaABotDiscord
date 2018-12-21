import BotPlugin from "../main/plugin.js";
import BotHooks from "../main/bot/botHooks.js";
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
