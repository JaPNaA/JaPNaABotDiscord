import PlayerHandler from "./playerHandler";
import BotHooks from "../../../main/bot/botHooks";
import Dealer from "./dealer";
import Games from "../../games";
import MessageHandler from "./messageHandler";
import Presidents from "./presidents";
declare class PresidentsMain {
    bot: BotHooks;
    parentGame: Games;
    playerHandler: PlayerHandler;
    messageHandler: MessageHandler;
    dealer: Dealer;
    constructor(botHooks: BotHooks, parentGame: Games, presidentsGame: Presidents);
    start(): void;
    private startMainLoop;
    private waitForTurn;
    private sortEveryonesDecks;
    private sendEveryoneTheirDecks;
    _start(): void;
    _stop(): void;
}
export default PresidentsMain;
