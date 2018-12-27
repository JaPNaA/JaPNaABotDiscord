import Player from "./player";
import BotHooks from "../../../main/bot/botHooks";
import Games from "../../games";
import ErrorCodes from "./errors";
import PresidentsGame from "./game";

class PlayerHandler {
    bot: BotHooks;
    parentGame: Games;
    presidentsGame: PresidentsGame;

    players: Player[];

    constructor(bot: BotHooks, parentGame: Games, presidentsGame: PresidentsGame) {
        this.bot = bot;
        this.parentGame = parentGame;
        this.presidentsGame = presidentsGame;

        this.players = [];
    }

    public addPlayer(userId: string): { succeeded: boolean, errorCode?: ErrorCodes } {
        if (this.isPlayerListed(userId)) {
            return { succeeded: false, errorCode: ErrorCodes.alreadyJoined };
        }

        if (!this.parentGame._isDMLockAvailable(userId)) {
            return { succeeded: false, errorCode: ErrorCodes.DMAlreadyLocked };
        }

        this.parentGame._lockAndGetDMHandle(userId, this.presidentsGame);
        this.players.push(new Player(this.bot, userId));

        return { succeeded: true };
    }

    public removePlayer(userId: string): boolean {
        let index = this.findPlayerIndex(userId);
        if (index < 0) {
            return false;
        } else {
            this.players.splice(index, 1);
            return true;
        }
    }

    private isPlayerListed(userId: string): boolean {
        let player = this.findPlayer(userId);

        if (player) {
            return true;
        } else {
            return false;
        }
    }

    private findPlayer(userId: string): Player | null {
        let player = this.players.find(player => player.userId === userId);
        if (player) {
            return player;
        } else {
            return null;
        }
    }

    private findPlayerIndex(userId: string): number {
        return this.players.findIndex(player => player.userId == userId);
    }
}

export default PlayerHandler;