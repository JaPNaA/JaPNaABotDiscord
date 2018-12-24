import BotPlugin from "../main/bot/plugin/plugin.js";
import BotHooks from "../main/bot/botHooks.js";
import { DiscordCommandEvent, DiscordMessageEvent } from "../main/events.js";
import { PrecommandWithoutCallback } from "../main/bot/precommand/precommand.js";
import SlapJack from "./games/slapjack.js";
import Game from "./games/game.js";

interface GameClass {
    new(botHooks: BotHooks, parentPlugin: Games, channelId: string): Game
}

/**
 * Games!
 */
class Games extends BotPlugin {
    precommand: PrecommandWithoutCallback;
    currentGames: Map<string, Game>;

    config: { [x: string]: any };

    gameAliases: { [x: string]: GameClass } = {
        "slapjack": SlapJack,
        "slap jack": SlapJack,
    };

    constructor(bot: BotHooks) {
        super(bot);
        this._pluginName = "games";
        this.config = bot.config.getPlugin(this._pluginName) as any;

        this.precommand = this._registerPrecommand(this.config.precommand);
        this.currentGames = new Map();
    }

    gPrecommandHandler(event: DiscordMessageEvent): void {
        this.bot.send(event.channelId, event.message);
    }

    play(bot: BotHooks, event: DiscordCommandEvent, args: string): void {
        let cleanedArgs = args.trim().toLowerCase();

        const gameClass = this._getGame(cleanedArgs);
        if (gameClass) {
            let game = new gameClass(this.bot, this, event.channelId);
            this.currentGames.set(event.channelId, game);
            game._start();
        } else {
            bot.send(event.channelId, 
                "That game doesn't exist :confused:\n" +
                "```c\n// TODO: add way to list all games```"
            );
        }
    }

    _getGame(name: string): GameClass | undefined {
        return this.gameAliases[name];
    }

    unknownCommandHandler(bot: BotHooks, event: DiscordCommandEvent) {
        let gameInChannel = this.currentGames.get(event.channelId);
        if (gameInChannel) { // forward to the game
            gameInChannel.commandManager.dispatch.onMessage(event);
        } else {
            bot.send(event.channelId, "lol that doesn't exist!1!! (and no game is running)!!");
        }
    }

    _start(): void {
        this._registerCommand(this.precommand, "play", this.play);
        this._registerUnknownCommandHandler(this.precommand, this.unknownCommandHandler);
    }
    _stop(): void {
        // do nothing
    }
}

export default Games;