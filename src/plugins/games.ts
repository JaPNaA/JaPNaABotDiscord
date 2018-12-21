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
class Game extends BotPlugin {
    constructor(bot: BotHooks) {
        super(bot);
        this._pluginName = "game";
    }

    gPrecommandHandler(event: DiscordMessageEvent) {
        this.bot.send(event.channelId, event.message);
    }

    game(bot: BotHooks, event: DiscordCommandEvent, args: string) {
        bot.send(event.channelId, "game");
    }

    _start() {
        this._registerCommand("game", this.game);
        this._registerPrecommandHander("g!", this.gPrecommandHandler);
    }
}

export default Game;