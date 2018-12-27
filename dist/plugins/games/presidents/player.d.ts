import CardsList from "../cards/cardList";
import { Rank } from "../cards/cardUtils";
import { Card, NormalCard } from "../cards/card";
import BotHooks from "../../../main/bot/botHooks";
import { DiscordCommandEvent } from "../../../main/events";
declare class PlayerCards {
    cards: CardsList;
    constructor();
    sort(): void;
    add(card: Card): void;
    countJokers(): number;
    count(rank: Rank): number;
    hasRank(rank: Rank, amount: number): boolean;
    hasJokers(amount: number): boolean;
    removeRank(rank: Rank, amount: number): Card[];
    removeJoker(amount: number): Card[];
    private removeCards;
    separateBurnAndNormalCards(): {
        burnCards: Card[];
        normalCards: NormalCard[];
    };
}
declare type MessageCallback = (event: DiscordCommandEvent) => any;
declare class Player {
    bot: BotHooks;
    userId: string;
    cards: PlayerCards;
    messageCallbacks: MessageCallback[];
    constructor(botHooks: BotHooks, userId: string);
    sendCards(): void;
    waitForOneMessage(callback: MessageCallback): void;
    onMessage(message: DiscordCommandEvent): void;
}
export default Player;
