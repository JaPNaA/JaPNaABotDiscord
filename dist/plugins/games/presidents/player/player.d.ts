import BotHooks from "../../../../main/bot/botHooks";
import { DiscordCommandEvent } from "../../../../main/events";
import PlayerCards from "./cards";
import PlayerAction from "./action";
import PresidentsMain from "../game";
import MessageType from "../messageType";
import MessageEvent from "../messageEvent";
declare type MessageCallback = (event: MessageEvent) => void;
declare class Player {
    bot: BotHooks;
    userId: string;
    cards: PlayerCards;
    action: PlayerAction;
    messageCallbacks: MessageCallback[];
    constructor(botHooks: BotHooks, presidentGame: PresidentsMain, userId: string);
    tell(message: string): void;
    createCardStr(): string;
    tellCards(): void;
    waitForOneMessage(callback: MessageCallback): void;
    onMessage(message: DiscordCommandEvent, type: MessageType): void;
}
export default Player;
