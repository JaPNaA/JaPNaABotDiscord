import BotPlugin from "../main/bot/plugin/plugin.js";
import BotHooks from "../main/bot/botHooks.js";
import { DiscordCommandEvent, DiscordMessageEvent } from "../main/events.js";
import { PrecommandWithoutCallback } from "../main/bot/precommand/precommand.js";
import SlapJack from "./games/slapjack.js";
import Game from "./games/game.js";

/**
 * Games!
 */
class Games extends BotPlugin {
    precommand: PrecommandWithoutCallback;
    currentGame?: Game;

    constructor(bot: BotHooks) {
        super(bot);
        this._pluginName = "game";

        this.precommand = this._registerPrecommand("g!");
    }

    gPrecommandHandler(event: DiscordMessageEvent): void {
        this.bot.send(event.channelId, event.message);
    }

    game(bot: BotHooks, event: DiscordCommandEvent, args: string): void {
        this.currentGame = new SlapJack(this.bot, event.channelId);
        this.currentGame._start();
    }

    _start(): void {
        this._registerCommand(this.precommand, "game", this.game);
    }
    _stop(): void {
        // do nothing
    }
}

export default Games;