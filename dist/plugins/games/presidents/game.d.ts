import PlayerHandler from "./playerHandler";
import Bot from "../../../main/bot/bot/bot";
import Dealer from "./dealer";
import Games from "../../games";
import MessageHandler from "./messageHandler";
import PresidentsGame from "./presidents";
import MessageParser from "./messageParser";
import Logic from "./logic";
import { Message } from "discord.js";
declare class PresidentsMain {
    bot: Bot;
    parentGame: Games;
    presidentsGame: PresidentsGame;
    playerHandler: PlayerHandler;
    messageHandler: MessageHandler;
    messageParser: MessageParser;
    logic: Logic;
    dealer: Dealer;
    pileMessage?: Message;
    constructor(botHooks: Bot, parentGame: Games, presidentsGame: PresidentsGame);
    start(): void;
    private startMainLoop;
    private waitForValidTurn;
    private waitForTurn;
    private handlePlayerTurnError;
    private sortEveryonesDecks;
    private tellEveryoneTheirDecksAndInstructions;
    private sendPile;
    private updatePile;
    mainLoopTick(): Promise<boolean>;
    private sendPlayerCards;
    private checkDone;
    private hasGameEnded;
    private announce;
    _start(): void;
    _stop(): void;
}
export default PresidentsMain;
