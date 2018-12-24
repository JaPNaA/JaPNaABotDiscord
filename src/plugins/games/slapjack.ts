import Deck from "./cards/deck";
import Game from "../games/game";
import BotHooks from "../../main/bot/botHooks";
import { toOne } from "../../main/utils";
import { Message } from "discord.js";
import { Rank } from "./cards/cardTypes";
import { Card } from "./cards/card";
import { DiscordCommandEvent } from "../../main/events";

class SlapJack extends Game {
    _pluginName: string = "game.slapjack";
    gameName: string = "Slap Jack";

    channelId: string;
    activeMessage?: Message;
    speedMilli: number = 1333;
    timeoutId?: NodeJS.Timeout;

    deck: Deck;
    jack: Rank = Rank.jack;

    acceptingSlaps: boolean;
    jackedTime: number;

    gameEnded: boolean = false;

    constructor(botHooks: BotHooks, channelId: string) {
        super(botHooks);

        this.deck = new Deck({
            excludeJokers: true
        });
        this.deck.shuffle();

        this.channelId = channelId;
        this.acceptingSlaps = false;
        this.jackedTime = 0;
    }

    _start() {
        this._registerCommand(this.commandManager, "slap", this.slap);

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

    slap(bot: BotHooks, event: DiscordCommandEvent, args: string) {
        if (this.acceptingSlaps) {
            bot.send(
                event.channelId, 
                `<@${event.userId}> did it! yay\n` + 
                (event.createdTimestamp - this.jackedTime).toString() + "ms"
            );

            this.gameEnded = true;
        } else {
            bot.send(event.channelId, "you slapped too early! violent!!");
        }
    }

    tick() {
        if (!this.activeMessage) { return; }

        let topCard: Card | undefined = this.deck.takeTop();
        if (!topCard) { throw new Error("No cards left"); }

        let promise = this.activeMessage.edit(topCard.toString());

        if (topCard.isRank(this.jack)) {
            this.jacked(promise);
        }
    }

    jacked(editPromise: Promise<any>) {
        this.stopTicking();
        editPromise.then(() => {
            this.acceptingSlaps = true;
            this.jackedTime = Date.now();
        });
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