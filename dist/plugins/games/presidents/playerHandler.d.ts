import Player from "./player/player";
import Bot from "../../../main/bot/bot/bot";
import Games from "../../games";
import Presidents from "./presidents";
declare class PlayerHandler {
    bot: Bot;
    parentGame: Games;
    presidentsGame: Presidents;
    players: Player[];
    constructor(bot: Bot, parentGame: Games, presidentsGame: Presidents);
    addPlayer(userId: string): void;
    getPlayer(userId: string): Player | null;
    private findPlayer;
}
export default PlayerHandler;
