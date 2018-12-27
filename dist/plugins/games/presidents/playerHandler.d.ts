import Player from "./player";
import BotHooks from "../../../main/bot/botHooks";
import Games from "../../games";
import ErrorCodes from "./errors";
import Presidents from "./presidents";
declare class PlayerHandler {
    bot: BotHooks;
    parentGame: Games;
    presidentsGame: Presidents;
    players: Player[];
    constructor(bot: BotHooks, parentGame: Games, presidentsGame: Presidents);
    addPlayer(userId: string): {
        succeeded: boolean;
        errorCode?: ErrorCodes;
    };
    removePlayer(userId: string): boolean;
    removeAllPlayers(): void;
    getPlayer(userId: string): Player | null;
    private isPlayerListed;
    private findPlayer;
    private findPlayerIndex;
}
export default PlayerHandler;
