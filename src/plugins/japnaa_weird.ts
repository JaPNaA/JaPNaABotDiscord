import DiscordMessageEvent from "../main/bot/events/discordMessageEvent";

import BotPlugin from "../main/bot/plugin/plugin.js";
import Bot from "../main/bot/bot/bot";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent";

/**
 * The weirder side of JaPNaABot
 */
class JapnaaWeird extends BotPlugin {
    lolRegexp: RegExp = /(\W|^)([l1|\\!/🇱\uff4c]+)+[\W_]*((h|w)*([a@&\*eiouy0.=\u1f1f4]|(\ud83c\udd7e\ufe0f))+(h|w)*)[\W_]*[l1|\\!/🇱\uff4c]+(\W|$)/i;
    // note: original (aggressive) lol detection: /(\s*[l|\\!/]+\s*)+\W*((h|w)*([aeiouy0.=]|(?!\s)\W)+(h|w)*)\W*[l|\\!/]+/i
    l$wlRegexp: RegExp = /(ЛЮЉ)|([l1|\\!/🇱\uff4c][\W_]*[e3🇪\uff45][\W_]*((vv)|[wu🇼ｗ])[\W_]*[l1|\\!/🇱\uff4c][\W_]*)|((the[\W_]*)?absolute[\W_]*(value[\W_]*)?(of[\W_]*)?[e3🇪\uff45][\W_]*(w|(vv)|u|🇼|ｗ))/gi;

    constructor(bot: Bot) {
        super(bot);
        this._pluginName = "japnaaweird";
    }

    /**
     * Tetris is a racing game.
     */
    tetris(event: DiscordCommandEvent): void {
        this.bot.client.send(event.channelId, "**Tetris is a " + (event.arguments || "racing") + " game**");
    }

    /**
     * JaP is kewl
     */
    jap(event: DiscordCommandEvent): void {
        this.bot.client.send(event.channelId, {
            embed: {
                color: this.bot.config.themeColor,
                description: "**JaP is " + (event.arguments || "kewl") + "**"
            }
        });
    }

    /**
     * ebola your parabola
     */
    your(event: DiscordCommandEvent): void {
        this.bot.client.send(event.channelId, "parabola");
    }

    /**
     * Listens for messages with 'lol' and deviations
     */
    async onmessageHandler_lol(event: DiscordMessageEvent) {
        if (!await this._isNaturalMessage(this.bot, event)) { return; }

        const numL$wl = this._countL$wl(event.message);

        if (numL$wl) {
            let str = "no ".repeat(numL$wl);
            this.bot.client.send(event.channelId, str);
        } else if (this.lolRegexp.test(event.message)) { // contains valid 'lol'
            this.bot.client.send(event.channelId, "lol");
        }
    }

    private _countL$wl(str: string): number {
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