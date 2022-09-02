import Deck from "./utils/cards/deck";
import Game from "../games/game";
import Bot from "../../main/bot/bot/bot";
import toOne from "../../main/utils/toOne";
import { Message } from "discord.js";
import { Rank } from "./utils/cards/cardUtils";
import { Card } from "./utils/cards/card";
import DiscordCommandEvent from "../../main/bot/events/discordCommandEvent";
import Games from "../games";
import mention from "../../main/utils/str/mention";

class SlapJack extends Game {
    _gamePluginName: string = "slapjack"
    pluginName: string = "game." + this._gamePluginName;
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

    constructor(botHooks: Bot, parentPlugin: Games, channelId: string) {
        super(botHooks, parentPlugin, channelId);

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

        this.bot.client.send(this.channelId, "Loading...")
            .then(e => {
                this.activeMessage = toOne(e);
                this.onReadyStart();
            });
    }

    onReadyStart() {
        this.bot.client.send(this.channelId, 
            "Type `" + this.parentPlugin.precommand.names[0] + 
            "slap` when the card above is a Jack"
        );
        this.startTicking();
    }

    *slap(event: DiscordCommandEvent) {
        if (this.acceptingSlaps) {
            yield mention(event.userId) + " did it! yay\n" + 
                (event.createdTimestamp - this.jackedTime).toString() + "ms";

            this.gameEnded = true;
        } else {
            return "you slapped too early! violent!!";
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