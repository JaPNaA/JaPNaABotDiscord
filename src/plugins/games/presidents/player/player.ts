import BotHooks from "../../../../main/bot/bot/botHooks";
import DiscordCommandEvent from "../../../../main/bot/types/discordCommandEvent";
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

    done: boolean;
    acknowledgedDone: boolean;

    constructor(botHooks: BotHooks, presidentGame: PresidentsMain, userId: string) {
        this.bot = botHooks;

        this.userId = userId;
        this.cards = new PlayerCards();
        this.action = new PlayerAction(this, presidentGame.logic);
        this.messageCallbacks = [];

        this.done = false;
        this.acknowledgedDone = false;
    }

    public checkDone() {
        if (this.cards.cards.size === 0) {
            this.done = true;
        }
    }

    tell(message: string) {
        this.bot.sendDM(this.userId, message);
    }

    createCardStr(): string {
        let cardStr = "";
        for (let card of this.cards.cards) {
            cardStr += card.toShortMD();
        }
        return cardStr;
    }

    tellCards() {
        if (this.done) { return; }
        this.bot.sendDM(this.userId, "**Your deck**\n" + this.createCardStr());
    }

    waitForOneMessage(callback: MessageCallback) {
        this.messageCallbacks.push(callback);
    }

    onMessage(message: DiscordCommandEvent, type: MessageType) {
        while (true) {
            const messageCallback = this.messageCallbacks.pop();
            if (!messageCallback) break;
            messageCallback({ message, type });
        }
    }
}

export default Player;