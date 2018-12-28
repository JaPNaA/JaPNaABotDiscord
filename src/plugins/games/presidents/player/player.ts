import BotHooks from "../../../../main/bot/botHooks";
import { DiscordCommandEvent } from "../../../../main/events";
import PlayerCards from "./cards";
import PlayerAction from "./action";
import PresidentsMain from "../game";
import MessageType from "../messageType";
import MessageEvent from "../messageEvent";

type MessageCallback = (event: MessageEvent) => void;

class Player {
    bot: BotHooks;
    userId: string;
    cards: PlayerCards;
    action: PlayerAction;
    messageCallbacks: MessageCallback[];

    constructor(botHooks: BotHooks, presidentGame: PresidentsMain, userId: string) {
        this.bot = botHooks;

        this.userId = userId;
        this.cards = new PlayerCards();
        this.action = new PlayerAction(this, presidentGame.logic);
        this.messageCallbacks = [];
    }

    tell(message: string) {
        this.bot.sendDM(this.userId, message);
    }

    tellCards() {
        let cardStr = "";
        for (let card of this.cards.cards) {
            cardStr += card.toShortMD();
        }
        this.bot.sendDM(this.userId, cardStr);
    }

    waitForOneMessage(callback: MessageCallback) {
        this.messageCallbacks.push(callback);
    }

    onMessage(message: DiscordCommandEvent, type: MessageType) {
        while (true) {
            const messageCallback = this.messageCallbacks.pop();
            if (!messageCallback) break;
            messageCallback({message, type});
        }
    }
}

export default Player;