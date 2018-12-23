import BotPlugin from "../main/bot/plugin/plugin.js";
import BotHooks from "../main/bot/botHooks.js";
import { DiscordCommandEvent, DiscordMessageEvent } from "../main/events.js";
import Precommand from "../main/bot/precommand/precommand.js";

/**
 * The weirder side of JaPNaABot
 */
class Game extends BotPlugin {
    precommand: Precommand;

    constructor(bot: BotHooks) {
        super(bot);
        this._pluginName = "game";

        this.precommand = this._registerPrecommand("g!");
    }

    gPrecommandHandler(event: DiscordMessageEvent) {
        this.bot.send(event.channelId, event.message);
    }

    game(bot: BotHooks, event: DiscordCommandEvent, args: string) {
        bot.send(event.channelId, "game");
    }

    _start() {
        this._registerCommand(this.precommand, "game", this.game);
    }
}

export default Game;