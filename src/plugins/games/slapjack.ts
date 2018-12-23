import Deck from "./cards/deck";
import Game from "../games/game";
import BotHooks from "../../main/bot/botHooks";
import { toOne } from "../../main/utils";
import { Message } from "discord.js";
import { Rank } from "./cards/cardTypes";
import { Card } from "./cards/card";

class SlapJack extends Game {
    channelId: string;
    activeMessage?: Message;

    speedMilli: number = 1333;

    timeoutId?: NodeJS.Timeout;

    deck: Deck;
    jack: Rank = Rank.jack;

    constructor(botHooks: BotHooks, channelId: string) {
        super(botHooks);

        this.deck = new Deck();
        this.deck.shuffle();

        this.channelId = channelId;
    }

    _start() {
        this.bot.send(this.channelId, "Loading...")
            .then(e => {
                this.activeMessage = toOne(e);
                this.onReadyStart();
            });
    }

    onReadyStart() {
        this.bot.send(this.channelId, "Type `g!slap` when the card above is a Jack");
        this.tick();
        this.startTicking();
    }

    tick() {
        if (!this.activeMessage) { return; }

        let topCard: Card | undefined = this.deck.takeTop();
        if (!topCard) { throw new Error("No cards left"); }

        if (topCard.isRank(this.jack)) {
            this.stopTicking();
        }

        this.activeMessage.edit(topCard.toString());
    }

    startTicking() {
        this.timeoutId = setInterval(() => {
            this.tick();
        }, this.speedMilli);
    }

    stopTicking() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }

    _stop() {
        //
    }
}

export default SlapJack;