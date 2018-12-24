import BotPlugin from "../main/bot/plugin/plugin.js";
import BotHooks from "../main/bot/botHooks.js";
import { DiscordCommandEvent, DiscordMessageEvent } from "../main/events.js";
import { PrecommandWithoutCallback } from "../main/bot/precommand/precommand.js";
import Game from "./games/game.js";
interface GameClass {
    new (botHooks: BotHooks, parentPlugin: Games, channelId: string): Game;
}
/**
 * Games!
 */
declare class Games extends BotPlugin {
    precommand: PrecommandWithoutCallback;
    currentGames: Map<string, Game>;
    config: {
        [x: string]: any;
    };
    gameAliases: {
        [x: string]: GameClass;
    };
    constructor(bot: BotHooks);
    gPrecommandHandler(event: DiscordMessageEvent): void;
    play(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    _getGame(name: string): GameClass | undefined;
    unknownCommandHandler(bot: BotHooks, event: DiscordCommandEvent): void;
    _start(): void;
    _stop(): void;
}
export default Games;
