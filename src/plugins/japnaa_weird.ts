import DiscordMessageEvent from "../main/bot/events/discordMessageEvent";

import BotPlugin from "../main/bot/plugin/plugin.js";
import Bot from "../main/bot/bot/bot";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent";
import { EventControls } from "../main/bot/events/eventHandlers";
import { Message, PartialMessage } from "discord.js";
import { ReplyReact, ReplySoft } from "../main/bot/actions/actions";

/**
 * The weirder side of JaPNaABot
 */
class JapnaaWeird extends BotPlugin {
    lolRegexp: RegExp = /(\W|^)(([l1|\\!/\uff4c]|(\ud83c\uddf1))+)+[\W_]*((h|w)*([a@&\*eiouy0.=]|(\ud83c\udd7e\ufe0f)|(\ud83c\uddf4))+(h|w)*)[\W_]*([l1|\\!/\uff4c]|(\ud83c\uddf1))+(\W|$)/i;
    // note: original (aggressive) lol detection: /(\s*[l|\\!/]+\s*)+\W*((h|w)*([aeiouy0.=]|(?!\s)\W)+(h|w)*)\W*[l|\\!/]+/i
    l$wlRegexp: RegExp = /.(ЛЮЉ)|(([l1|\\!/\uff4c]|(\ud83c\uddf1))[\W_]*([e3\uff45]|(\ud83c\uddea))[\W_]*((vv)|(\ud83c\uddfc)|[wuｗ])[\W_]*([l1|\\!/\uff4c]|(\ud83c\uddf1))[\W_]*)|((the[\W_]*)?absolute[\W_]*(value[\W_]*)?(of[\W_]*)?([e3\uff45]|(\ud83c\uddea))[\W_]*((vv)|(\ud83c\uddfc)|[wuｗ]))/gi;
    // note: original (including i as L) l$wlRegexp: /.(ЛЮЉ)|(([il1|\\!/\uff4c]|(\ud83c\uddf1))[\W_]*([e3\uff45]|(\ud83c\uddea))[\W_]*((vv)|(\ud83c\uddfc)|[wuｗ])[\W_]*([il1|\\!/\uff4c]|(\ud83c\uddf1))[\W_]*)|((the[\W_]*)?absolute[\W_]*(value[\W_]*)?(of[\W_]*)?([e3\uff45]|(\ud83c\uddea))[\W_]*((vv)|(\ud83c\uddfc)|[wuｗ]))/gi;
    goodBotRegexp: RegExp = /(\s|^)good bots?(\s|$)/i;
    badBotRegexp: RegExp = /(\s|^)bad bots?(\s|$)/i;
    noMessageRegexp: RegExp = /^\s*(no\s*)+$/;

    constructor(bot: Bot) {
        super(bot);
        this.pluginName = "japnaaweird";
    }

    /**
     * Tetris is a racing game.
     */
    *tetris(event: DiscordCommandEvent) {
        yield "**Tetris is a " + (event.arguments || "racing") + " game**";
    }

    /**
     * JaP is kewl
     */
    *jap(event: DiscordCommandEvent) {
        yield {
            embeds: [{
                color: this.bot.config.themeColor,
                description: "**JaP is " + (event.arguments || "kewl") + "**"
            }]
        };
    }

    /**
     * ebola your parabola
     */
    *your() {
        yield "parabola";
    }

    *what_should_i_wear() {
        yield "It's -273.15°C in space, so you should wear:\n" +
            "  - nothing on your head\n" +
            "  - nothing on your torso\n" +
            "  - nothing on your legs\n" +
            "  - nothing on your feet\n" +
            "  - nothing on your hands\n" +
            "You cannot save this outfit by telling to me `save outfit`!";
    }

    /**
     * Listens for messages with 'lol' and deviations
     */
    async *onmessageHandler_lol(event: DiscordMessageEvent, eventControls: EventControls) {
        if (!await this._isUserMessage(this.bot, event)) { return; }

        const numL$wl = this._countL$wl(event.message);

        if (numL$wl) {
            yield "no ".repeat(numL$wl);
            // ignore commands with matching l$wl
            if (event.precommandName) { eventControls.preventSystemNext(); }
        } else if (!event.precommandName) {
            if (this.lolRegexp.test(event.message)) {
                // ^ contains valid 'lol' and is not command
                yield "lol";
            }

            if (this.goodBotRegexp.test(event.message)) {
                yield new ReplyReact("\ud83d\ude04");
            }
            if (this.badBotRegexp.test(event.message)) {
                yield new ReplyReact("\ud83d\ude26");
            }
        }
    }

    private async messageEditHandler(oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage) {
        const oldCount = oldMessage.content ? this._countL$wl(oldMessage.content) : 0;
        const newCount = newMessage.content ? this._countL$wl(newMessage.content) : 0;
        const delta = newCount - oldCount;
        if (delta <= 0) { return; }
        if (!('messages' in newMessage.channel)) { return; }
        const messagesAfter = await newMessage.channel.messages.fetch({
            after: newMessage.id,
            limit: 3
        });

        let noMessage;
        for (const [id, message] of messagesAfter) {
            if (message.author.id === this.bot.client.id && this.noMessageRegexp.test(message.content)) {
                noMessage = message;
                break;
            }
        }

        if (noMessage) {
            const currCount = noMessage.content.match(/no/ig)?.length || 0;
            noMessage.edit("no ".repeat(currCount + delta));
        } else {
            this.bot.client.send(newMessage.thread?.id || newMessage.channelId, "no ".repeat(delta));
        }
    }

    private _countL$wl(str: string): number {
        let i = 0;
        for (let match; match = this.l$wlRegexp.exec(str); i++) {
            if (str.slice(match.index - 1, match.index + 3).toLowerCase() === "view") {
                i--;
            }
        }
        return i;
    }

    async _isUserMessage(bot: Bot, event: DiscordMessageEvent): Promise<boolean> {
        const user = await bot.client.getUser(event.userId);
        return Boolean(
            user && !user.bot
        );
    }

    _start(): void {
        this._registerDefaultCommand("jap", this.jap);
        this._registerDefaultCommand("tetris", this.tetris);
        this._registerDefaultCommand("your", this.your);
        this._registerDefaultCommand("what should i wear", this.what_should_i_wear, {
            help: {
                description: "Replies with a message in memory of 'outfit based on weather bot.' If JaPNaA feels like it some day, they may reimplement the behavior in JaPNaABot."
            }
        });

        this._registerMessageHandler(this.onmessageHandler_lol);

        this.messageEditHandler = this.messageEditHandler.bind(this);
        this.bot.client.client.on("messageUpdate", this.messageEditHandler);
    }

    _stop(): void {
        this.bot.client.client.off("messageUpdate", this.messageEditHandler);
    }
}

export default JapnaaWeird;