import Player from "./player/player";
import BotHooks from "../../../main/bot/botHooks";
import Games from "../../games";
import Presidents from "./presidents";
import { AlreadyJoinedError, DMAlreadyLockedError } from "./errors";

class PlayerHandler {
    bot: BotHooks;
    parentGame: Games;
    presidentsGame: Presidents;

    players: Player[];

    constructor(bot: BotHooks, parentGame: Games, presidentsGame: Presidents) {
        this.bot = bot;
        this.parentGame = parentGame;
        this.presidentsGame = presidentsGame;

        this.players = [];
    }

    public addPlayer(userId: string): void {
        if (this.isPlayerListed(userId)) {
            throw new AlreadyJoinedError();
        }

        if (!this.parentGame._isDMLockAvailable(userId)) {
            throw new DMAlreadyLockedError();
        }

        this.parentGame._lockAndGetDMHandle(userId, this.presidentsGame);
        this.players.push(new Player(this.bot, this.presidentsGame.game, userId));
    }

    public removePlayer(userId: string): boolean {
        let index = this.findPlayerIndex(userId);
        if (index < 0) {
            return false;
        } else {
            this.parentGame._unlockDMHandle(userId);
            this.players.splice(index, 1);
            return true;
        }
    }

    public removeAllPlayers() {
        for (let player of this.players) {
            this.parentGame._unlockDMHandle(player.userId);
        }
        this.players.length = 0;
    }

    public getPlayer(userId: string): Player | null {
        return this.findPlayer(userId);
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