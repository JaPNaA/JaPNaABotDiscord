import BotHooks from "../main/bot/bot/botHooks.js";
import DiscordMessageEvent from "../main/bot/events/discordMessageEvent";

import BotPlugin from "../main/bot/plugin/plugin.js";
import { User } from "discord.js";

/**
 * The weirder side of JaPNaABot
 */
class JapnaaWeird extends BotPlugin {
    lolRegexp: RegExp = /(\W|^)([l1|\\!/]+)+\s*((h|w)*([aeiouy0.=])+(h|w)*)\s*[l1|\\!/]+(\W|$)/i;
    // note: original (aggressive) lol detection: /(\s*[l|\\!/]+\s*)+\W*((h|w)*([aeiouy0.=]|(?!\s)\W)+(h|w)*)\W*[l|\\!/]+/i
    l$wlRegexp: RegExp = /[l1|\\!/]\s*(e|3)\s*(w|(vv))\s*[l1|\\!/]\s*/gi;

    constructor(bot: BotHooks) {
        super(bot);
        this._pluginName = "japnaaweird";
    }

    /**
     * Tetris is a racing game.
     */
    tetris(bot: BotHooks, event: DiscordMessageEvent, args: string): void {
        bot.send(event.channelId, "**Tetris is a " + (args || "racing") + " game**");
    }

    /**
     * JaP is kewl
     */
    jap(bot: BotHooks, event: DiscordMessageEvent, args: string): void {
        bot.send(event.channelId, {
            embed: {
                color: bot.config.themeColor,
                description: "**JaP is " + (args || "kewl") + "**"
            }
        });
    }

    /**
     * ebola your parabola
     */
    your(bot: BotHooks, event: DiscordMessageEvent): void {
        bot.send(event.channelId, "parabola");
    }

    /**
     * Listens for messages with 'lol' and deviations
     */
    onmessageHandler_lol(bot: BotHooks, event: DiscordMessageEvent): void {
        if (!this._isNaturalMessage(bot, event)) { return; }

        const numL$wl = this._countL$wl(event.message);

        if (numL$wl) {
            let str = "no ".repeat(numL$wl);
            bot.send(event.channelId, str);
        } else if (this.lolRegexp.test(event.message)) { // contains valid 'lol'
            bot.send(event.channelId, "lol");
        }
    }

    _countL$wl(str: string): number {
        let i = 0;
        for (let match; match = this.l$wlRegexp.exec(str); i++) { }
        return i;
    }

    _isNaturalMessage(bot: BotHooks, event: DiscordMessageEvent): boolean {
        const user: User | undefined = bot.getUser(event.userId);
        return Boolean(
            !event.precommandName && // is not a command
            user && !user.bot
        );
    }

    _start(): void {
        this._registerDefaultCommand("jap", this.jap);
        this._registerDefaultCommand("tetris", this.tetris);
        this._registerDefaultCommand("your", this.your);

        this._registerEventHandler("message", this.onmessageHandler_lol);

        this.bot.events.on("start",
            function (this: JapnaaWeird): void {
                // this.bot.client.presence.setWatch("you");
                this.bot.client.presence.setGame("development");
            }.bind(this));
    }

    _stop(): void {
        // do nothing
    }
}

export default JapnaaWeird;