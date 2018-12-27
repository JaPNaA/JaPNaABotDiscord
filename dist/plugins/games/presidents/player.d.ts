import CardsList from "../cards/cardList";
import { Rank } from "../cards/cardUtils";
import { Card, NormalCard } from "../cards/card";
import BotHooks from "../../../main/bot/botHooks";
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
declare class Player {
    bot: BotHooks;
    userId: string;
    cards: PlayerCards;
    constructor(botHooks: BotHooks, userId: string);
    sendCards(): void;
}
export default Player;
