import Player from "./player";
import BotHooks from "../../../main/bot/botHooks";
import Games from "../../games";
import ErrorCodes from "./errors";
import PresidentsGame from "./game";
declare class PlayerHandler {
    bot: BotHooks;
    parentGame: Games;
    presidentsGame: PresidentsGame;
    players: Player[];
    constructor(bot: BotHooks, parentGame: Games, presidentsGame: PresidentsGame);
    addPlayer(userId: string): {
        succeeded: boolean;
        errorCode?: ErrorCodes;
    };
    removePlayer(userId: string): boolean;
    private isPlayerListed;
    private findPlayer;
    private findPlayerIndex;
}
export default PlayerHandler;
