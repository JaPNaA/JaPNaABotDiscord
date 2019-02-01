import BotPlugin from "../main/bot/plugin/plugin.js";
import BotHooks from "../main/bot/bot/botHooks.js";
import DiscordCommandEvent from "../main/bot/types/discordCommandEvent";
import { PrecommandWithoutCallback } from "../main/bot/precommand/precommand.js";

import Game from "./games/game.js";

import SlapJack from "./games/slapjack.js";
import Presidents from "./games/presidents/presidents.js";
import BotCommandOptions from "../main/bot/command/commandOptions.js";

interface GameClass {
    new(botHooks: BotHooks, parentPlugin: Games, channelId: string, initer: string): Game
}

/**
 * Games!
 */
class Games extends BotPlugin {
    precommand: PrecommandWithoutCallback;
    currentGames: Map<string, Game>;
    playerGameMap: Map<string, Game>;

    config: { [x: string]: any };

    gameAliases: { [x: string]: GameClass } = {
        "slapjack": SlapJack,
        "slap jack": SlapJack,

        "president": Presidents,
        "presidents": Presidents,
        "kings": Presidents,
        "scum": Presidents
    };

    constructor(bot: BotHooks) {
        super(bot);
        this._pluginName = "games";
        this.config = bot.config.getPlugin(this._pluginName) as any;

        this.precommand = this._registerPrecommand(this.config.precommand);
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

    public _unlockDMHandle(userId: string) {
        this.playerGameMap.delete(userId);
    }

    private play(bot: BotHooks, event: DiscordCommandEvent, args: string): void {
        let currentGame = this.currentGames.get(event.channelId);
        if (currentGame) {
            // TODO: confirm to end current game
            currentGame._stop();
        }

        let cleanedArgs = args.trim().toLowerCase();

        const gameClass = this._getGame(cleanedArgs);
        
        if (gameClass) {
            let game = new gameClass(this.bot, this, event.channelId, event.userId);
            this.currentGames.set(event.channelId, game);
            game._start();
        } else {
            bot.send(event.channelId, 
                "That game doesn't exist :confused:\n" +
                "```c\n// TODO: add way to list all games```"
            );
        }
    }

    private _getGame(name: string): GameClass | undefined {
        return this.gameAliases[name];
    }

    _start(): void {
        this._registerCommand(this.precommand, "play", this.play, new BotCommandOptions({
            noDM: true
        }));

        this._registerUnknownCommandHandler(this.precommand, this.unknownCommandHandler);
    }

    private unknownCommandHandler(bot: BotHooks, event: DiscordCommandEvent) {
        if (event.isDM) {
            this._forwardToGameFromDM(bot, event);
        } else {
            this._forwardToGameInChannel(bot, event);
        }
    }

    private _forwardToGameInChannel(bot: BotHooks, event: DiscordCommandEvent) {
        let gameInChannel = this.currentGames.get(event.channelId);
        if (gameInChannel) {
            gameInChannel.commandManager.dispatch.onMessage(event);
        } else {
            this._sendDoesntExist(bot, event);
        }
    }

    private _forwardToGameFromDM(bot: BotHooks, event: DiscordCommandEvent) {
        let game = this.playerGameMap.get(event.userId);
        if (game) {
            game.commandManager.dispatch.onMessage(event);
        } else {
            this._sendDoesntExist(bot, event);
        }
    }

    private _sendDoesntExist(bot: BotHooks, event: DiscordCommandEvent) {
        bot.send(event.channelId, "lol that doesn't exist!1!! (and no game is running)!!");
    }

    _stop(): void {
        // do nothing
    }
}

export default Games;