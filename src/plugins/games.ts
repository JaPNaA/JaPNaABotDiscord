import BotPlugin from "../main/bot/plugin/plugin.js";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent";
import { PrecommandWithoutCallback } from "../main/bot/precommand/precommand.js";

import Game from "./games/game.js";

import SlapJack from "./games/slapjack.js";
import Presidents from "./games/presidents/presidents.js";
import Chess from "./games/chess/chess";
import Bot from "../main/bot/bot/bot.js";
import { RockPaperScissors } from "./games/rockPaperScissors.js";
import { Othello } from "./games/othello.js";

interface GameClass {
    new(bot: Bot, parentPlugin: Games, channelId: string, initer: string): Game
}

/**
 * Games!
 */
class Games extends BotPlugin {
    precommand: PrecommandWithoutCallback;
    currentGames: Map<string, Game>;
    playerGameMap: Map<string, Game>;

    gameAliases: { [x: string]: GameClass } = {
        "slapjack": SlapJack,
        "slap jack": SlapJack,

        "president": Presidents,
        "presidents": Presidents,
        "kings": Presidents,
        "scum": Presidents,

        "chess": Chess,

        "rps": RockPaperScissors,
        "rock paper scissors": RockPaperScissors,

        "othello": Othello,
        "reversi": Othello,
        "オセロ": Othello,
        "リバーシ": Othello,
    };

    constructor(bot: Bot) {
        super(bot);
        this.pluginName = "games";

        this.precommand = this._registerPrecommand(this.config.get("precommand") as string);
        this.currentGames = new Map();
        this.playerGameMap = new Map();
    }

    public _isDMLockAvailable(userId: string): boolean {
        return this.playerGameMap.get(userId) === undefined;
    }

    public _lockAndGetDMHandle(userId: string, game: Game) {
        if (this._isDMLockAvailable(userId)) {
            this.playerGameMap.set(userId, game);
        } else {
            throw new Error("Already locked");
        }
    }

    public _unlockDMHandle(userId: string, game: Game) {
        const lockedGame = this.playerGameMap.get(userId);
        if (!lockedGame) { return; }
        if (lockedGame !== game) {
            throw new Error(`Tried to unlock game not locked on. (Unlock from ${game.gameName} of ${lockedGame.gameName})`);
        }
        this.playerGameMap.delete(userId);
    }

    private *play(event: DiscordCommandEvent) {
        let currentGame = this.currentGames.get(event.channelId);
        if (currentGame) {
            // TODO: confirm to end current game
            currentGame._stop();
        }

        let cleanedArgs = event.arguments.trim().toLowerCase();

        const gameClass = this._getGame(cleanedArgs);

        if (gameClass) {
            let game = new gameClass(this.bot, this, event.channelId, event.userId);
            this.currentGames.set(event.channelId, game);
            game._start();
        } else {
            return "That game doesn't exist :confused:\n" +
                "Games available: " + this._listGames().join(", ");
        }
    }

    private _getGame(name: string): GameClass | undefined {
        return this.gameAliases[name];
    }

    _start(): void {
        this._registerCommand(this.precommand, "play", this.play, {
            noDM: true
        });

        this._registerUnknownCommandHandler(this.precommand, this.unknownCommandHandler);
    }

    private *unknownCommandHandler(event: DiscordCommandEvent) {
        if (event.isDM) {
            this._forwardToGameFromDM(event);
        } else {
            this._forwardToGameInChannel(event);
        }
    }

    private _forwardToGameInChannel(event: DiscordCommandEvent) {
        let gameInChannel = this.currentGames.get(event.channelId);
        if (gameInChannel) {
            gameInChannel.commandManager.dispatch.onMessage(event);
        } else {
            this._sendDoesntExist(event);
        }
    }

    private _forwardToGameFromDM(event: DiscordCommandEvent) {
        let game = this.playerGameMap.get(event.userId);
        if (game) {
            game.commandManager.dispatch.onMessage(event);
        } else {
            this._sendDoesntExist(event);
        }
    }

    private _sendDoesntExist(event: DiscordCommandEvent) {
        this.bot.client.send(event.channelId, "No game is running...");
    }

    private _listGames(): string[] {
        const set = new Set();
        const names = [];
        const potentialNames = Object.keys(this.gameAliases);

        for (const name of potentialNames) {
            if (!set.has(this.gameAliases[name])) {
                names.push(name);
                set.add(this.gameAliases[name]);
            }
        }

        return names;
    }

    _stop(): void {
        // do nothing
    }
}

export default Games;