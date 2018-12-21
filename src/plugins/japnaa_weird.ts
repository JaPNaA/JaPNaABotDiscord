import BotHooks from "../main/bot/botHooks.js";
import { DiscordMessageEvent } from "../main/events.js";

import BotPlugin from "../main/plugin.js";

/**
 * The weirder side of JaPNaABot
 */
class JapnaaWeird extends BotPlugin {
    lolRegexp: RegExp = /(\s*[l|\\/]+\s*)+\W*((h|w)*([aeiouy0.=]|(?!\s)\W)+(h|w)*)\W*[l|\\/]+/i;

    constructor(bot: BotHooks) {
        super(bot);
        this._pluginName = "japnaaweird";
    }

    /**
     * Tetris is a racing game.
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args What type of game is Tetris?
     */
    tetris(bot: BotHooks, event: DiscordMessageEvent, args: string) {
        bot.send(event.channelId, "**Tetris is a " + (args || "racing") + " game**");
    }

    /**
     * JaP is kewl
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     * @param {String} args What is JaP?
     */
    jap(bot: BotHooks, event: DiscordMessageEvent, args: string) {
        bot.send(event.channelId, {
            embed: {
                color: bot.config.themeColor,
                description: "**JaP is " + (args || "kewl") + "**"
            }
        });
    }

    /**
     * ebola your parabola
     * @param {BotHooks} bot
     * @param {DiscordMessageEvent} event message event
     */
    your(bot: BotHooks, event: DiscordMessageEvent) {
        bot.send(event.channelId, "parabola");
    }

    /**
     * Listens for messages with 'lol' and deviations
     * @param {BotHooks} bot bot
     * @param {DiscordMessageEvent} event message event
     */
    onmessageHandler_lol(bot: BotHooks, event: DiscordMessageEvent) {
        const user = bot.getUser(event.userId);
        if (
            !event.precommand && // is not a command
            user && !user.bot && // sender is not a bot
            this.lolRegexp.test(event.message) // contains valid 'lol'
        ) {
            bot.send(event.channelId, "lol");
        }
    }

    _start() {
        this._registerCommand("jap", this.jap);
        this._registerCommand("tetris", this.tetris);
        this._registerCommand("your", this.your);

        this._registerEventHandler("message", this.onmessageHandler_lol);

        this.bot.events.on("start",
            function (this: JapnaaWeird) {
                this.bot.client.presence.setWatch("you");
            }.bind(this));
    }
}

export default JapnaaWeird;