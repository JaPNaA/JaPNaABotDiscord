const BotPlugin = require("../dist/plugin.js");

/**
 * @typedef {import("../dist/events.js").DiscordMessageEvent} DiscordMessageEvent
 * @typedef {import("../dist/bot/botHooks.js")} BotHooks
 */

/**
 * The weirder side of JaPNaABot
 */
class Game extends BotPlugin {
    constructor(bot) {
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

module.exports = Game;