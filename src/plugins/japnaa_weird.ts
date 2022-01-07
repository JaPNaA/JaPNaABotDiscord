import DiscordMessageEvent from "../main/bot/events/discordMessageEvent";

import BotPlugin from "../main/bot/plugin/plugin.js";
import { User } from "discord.js";
import Bot from "../main/bot/bot/bot";

/**
 * The weirder side of JaPNaABot
 */
class JapnaaWeird extends BotPlugin {
    lolRegexp: RegExp = /(\W|^)([l1|\\!/]+)+\s*((h|w)*([a@&\*eiouy0.=])+(h|w)*)\s*[l1|\\!/]+(\W|$)/i;
    // note: original (aggressive) lol detection: /(\s*[l|\\!/]+\s*)+\W*((h|w)*([aeiouy0.=]|(?!\s)\W)+(h|w)*)\W*[l|\\!/]+/i
    l$wlRegexp: RegExp = /([l1|\\!/][\W_]*(e|3)[\W_]*(w|(vv))[\W_]*[l1|\\!/][\W_]*)|((the[\W_]*)?absolute[\W_]*(value[\W_]*)?(of[\W_]*)?(e|3)[\W_]*(w|(vv)))/gi;

    constructor(bot: Bot) {
        super(bot);
        this._pluginName = "japnaaweird";
    }

    /**
     * Tetris is a racing game.
     */
    tetris(bot: Bot, event: DiscordMessageEvent, args: string): void {
        bot.client.send(event.channelId, "**Tetris is a " + (args || "racing") + " game**");
    }

    /**
     * JaP is kewl
     */
    jap(bot: Bot, event: DiscordMessageEvent, args: string): void {
        bot.client.send(event.channelId, {
            embed: {
                color: bot.config.themeColor,
                description: "**JaP is " + (args || "kewl") + "**"
            }
        });
    }

    /**
     * ebola your parabola
     */
    your(bot: Bot, event: DiscordMessageEvent): void {
        bot.client.send(event.channelId, "parabola");
    }

    /**
     * Listens for messages with 'lol' and deviations
     */
    async onmessageHandler_lol(bot: Bot, event: DiscordMessageEvent) {
        if (!await this._isNaturalMessage(bot, event)) { return; }

        const numL$wl = this._countL$wl(event.message);

        if (numL$wl) {
            let str = "no ".repeat(numL$wl);
            bot.client.send(event.channelId, str);
        } else if (this.lolRegexp.test(event.message)) { // contains valid 'lol'
            bot.client.send(event.channelId, "lol");
        }
    }

    _countL$wl(str: string): number {
        let i = 0;
        for (let match; match = this.l$wlRegexp.exec(str); i++) { }
        return i;
    }

    async _isNaturalMessage(bot: Bot, event: DiscordMessageEvent): Promise<boolean> {
        const user = await bot.client.getUser(event.userId);
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