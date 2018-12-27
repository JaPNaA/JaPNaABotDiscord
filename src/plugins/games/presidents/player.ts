import CardsList from "../cards/cardList";
import { Rank } from "../cards/cardUtils";
import { Card, NormalCard } from "../cards/card";
import BotHooks from "../../../main/bot/botHooks";
import { DiscordCommandEvent } from "../../../main/events";

class PlayerCards {
    cards: CardsList;

    constructor() {
        this.cards = new CardsList([]);
    }

    public sort() {
        this.cards.sortByRank();
    }

    public add(card: Card) {
        this.cards.add(card);
    }

    public countJokers(): number {
        return this.cards.getAllJokers().length;
    }
    public count(rank: Rank): number {
        return this.cards.getAllRank(rank).length;
    }

    public hasRank(rank: Rank, amount: number): boolean {
        let count = this.count(rank);
        if (count >= amount) { return true; }
        else { return false; }
    }

    public hasJokers(amount: number): boolean {
        let count = this.countJokers();
        if (count >= amount) { return true; }
        else { return false; }
    }

    public removeRank(rank: Rank, amount: number): Card[] {
        let cards = this.cards.getAllRank(rank).slice(0, amount);
        this.removeCards(cards, amount);
        return cards;
    }

    public removeJoker(amount: number): Card[] {
        let cards = this.cards.getAllJokers().slice(0, amount);
        this.removeCards(cards, amount);
        return cards;
    }

    private removeCards(cards: Card[], amount: number) {
        if (cards.length < amount) { throw new Error("Not enough cards"); }

        for (let card of cards) {
            this.cards.remove(card);
        }
    }

    public separateBurnAndNormalCards(): {
        burnCards: Card[],
        normalCards: NormalCard[]
    } {
        let normalCards: NormalCard[] = [];
        let burnCards: Card[] = [];

        for (let card of this.cards) {
            if (card.isRank(Rank.n2) || card.isJoker()) {
                burnCards.push(card);
            } else {
                normalCards.push(card as NormalCard);
            }
        }
        return { burnCards: burnCards, normalCards: normalCards };
    }
}

type MessageCallback = (event: DiscordCommandEvent) => any; 

class Player {
    bot: BotHooks;
    userId: string;
    cards: PlayerCards;
    messageCallbacks: MessageCallback[];

    constructor(botHooks: BotHooks, userId: string) {
        this.bot = botHooks;

        this.userId = userId;
        this.cards = new PlayerCards();
        this.messageCallbacks = [];
    }

    sendCards() {
        let cardStr = "";
        for (let card of this.cards.cards) {
            cardStr += card.toShortMD();
        }
        this.bot.sendDM(this.userId, cardStr);
    }

    waitForOneMessage(callback: MessageCallback) {
        this.messageCallbacks.push(callback);
    }

    onMessage(message: DiscordCommandEvent) {
        while (true) {
            const messageCallback = this.messageCallbacks.pop();
            if (!messageCallback) break;
            messageCallback(message);
        }
    }
}

export default Player;