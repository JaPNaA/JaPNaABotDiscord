import Player from "./player/player";
import Bot from "../../../main/bot/bot/bot";
import Games from "../../games";
import Presidents from "./presidents";

class PlayerHandler {
    bot: Bot;
    parentGame: Games;
    presidentsGame: Presidents;

    players: Player[];

    constructor(bot: Bot, parentGame: Games, presidentsGame: Presidents) {
        this.bot = bot;
        this.parentGame = parentGame;
        this.presidentsGame = presidentsGame;

        this.players = [];
    }

    public addPlayer(userId: string) {
        this.players.push(new Player(this.bot, this.presidentsGame.game, userId));
    }

    public getPlayer(userId: string): Player | null {
        return this.findPlayer(userId);
    }

    private findPlayer(userId: string): Player | null {
        let player = this.players.find(player => player.userId === userId);
        if (player) {
            return player;
        } else {
            return null;
        }
    }
}

export default PlayerHandler;