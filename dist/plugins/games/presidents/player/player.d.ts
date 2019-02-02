import BotHooks from "../../../../main/bot/bot/botHooks";
import DiscordCommandEvent from "../../../../main/bot/events/discordCommandEvent";
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
    done: boolean;
    acknowledgedDone: boolean;
    constructor(botHooks: BotHooks, presidentGame: PresidentsMain, userId: string);
    checkDone(): void;
    tell(message: string): void;
    createCardStr(): string;
    tellCards(): void;
    waitForOneMessage(callback: MessageCallback): void;
    onMessage(message: DiscordCommandEvent, type: MessageType): void;
}
export default Player;
