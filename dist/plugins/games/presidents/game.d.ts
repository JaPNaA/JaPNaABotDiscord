import PlayerHandler from "./playerHandler";
import BotHooks from "../../../main/bot/botHooks";
import Dealer from "./dealer";
import Games from "../../games";
import Game from "../game";
declare class PresidentsGame extends Game {
    parentGame: Games;
    playerHandler: PlayerHandler;
    dealer: Dealer;
    constructor(botHooks: BotHooks, parentGame: Games);
    start(): void;
    private startMainLoop;
    private sendEveryoneTheirDecks;
    _start(): void;
    _stop(): void;
}
export default PresidentsGame;
