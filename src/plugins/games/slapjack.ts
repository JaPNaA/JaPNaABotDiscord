import Deck from "./cards/deck";
import Game from "../games/game";
import BotHooks from "../../main/bot/bot/botHooks";
import toOne from "../../main/utils/toOne";
import { Message } from "discord.js";
import { Rank } from "./cards/cardUtils";
import { Card } from "./cards/card";
import DiscordCommandEvent from "../../main/bot/events/discordCommandEvent";
import Games from "../games";
import { mention } from "../../main/utils/specialUtils";

class SlapJack extends Game {
    _gamePluginName: string = "slapjack"
    _pluginName: string = "game." + this._gamePluginName;
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

    constructor(botHooks: BotHooks, parentPlugin: Games, channelId: string) {
        super(botHooks, parentPlugin);

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
        this.bot.send(this.channelId, 
            "Type `" + this.parentPlugin.precommand.names[0] + 
            "slap` when the card above is a Jack"
        );
        this.startTicking();
    }

    slap(bot: BotHooks, event: DiscordCommandEvent, args: string) {
        if (this.acceptingSlaps) {
            bot.send(
                event.channelId, 
                mention(event.userId) + " did it! yay\n" + 
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
        this.stopTicking();
    }
}

export default SlapJack;