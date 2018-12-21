import BotPlugin from "../plugin.js";
import BotHooks from "../bot/botHooks.js";

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

    gPrecommandHandler() {
        //
    }

    game() {
        //
    }

    _start() {
        this._registerCommand("game", this.game);

        // this._registerEventHandler("message", this.onmessageHandler_lol);
    }
}

export default Game;