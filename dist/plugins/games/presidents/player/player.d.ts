import BotHooks from "../../../../main/bot/botHooks";
import { DiscordCommandEvent } from "../../../../main/events";
import PlayerCards from "./cards";
import PlayerAction from "./action";
import PresidentsMain from "../game";
declare type MessageCallback = (event: DiscordCommandEvent) => void;
declare class Player {
    bot: BotHooks;
    userId: string;
    cards: PlayerCards;
    action: PlayerAction;
    messageCallbacks: MessageCallback[];
    constructor(botHooks: BotHooks, presidentGame: PresidentsMain, userId: string);
    tell(message: string): void;
    tellCards(): void;
    waitForOneMessage(callback: MessageCallback): void;
    onMessage(message: DiscordCommandEvent): void;
}
export default Player;
