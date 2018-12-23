import BotPlugin from "../main/bot/plugin/plugin.js";
import BotHooks from "../main/bot/botHooks.js";
import { DiscordCommandEvent, DiscordMessageEvent } from "../main/events.js";
import { PrecommandWithoutCallback } from "../main/bot/precommand/precommand.js";
import Deck from "./games/cards/deck.js";

/**
 * Games!
 */
class Game extends BotPlugin {
    precommand: PrecommandWithoutCallback;

    constructor(bot: BotHooks) {
        super(bot);
        this._pluginName = "game";

        this.precommand = this._registerPrecommand("g!");
    }

    gPrecommandHandler(event: DiscordMessageEvent): void {
        this.bot.send(event.channelId, event.message);
    }

    game(bot: BotHooks, event: DiscordCommandEvent, args: string): void {
        let deck: Deck = new Deck({
            excludeKnights: false
        });
        let str: string = "";

        for (let card of deck.cards) {
            str += card.toShortMD() + ", ";
        }

        bot.send(event.channelId, str);
    }

    _start(): void {
        this._registerCommand(this.precommand, "game", this.game);
    }
    _stop(): void {
        // do nothing
    }
}

export default Game;