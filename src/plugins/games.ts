import BotPlugin from "../main/plugin.js";
import BotHooks from "../main/bot/botHooks.js";

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