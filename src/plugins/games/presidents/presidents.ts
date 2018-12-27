import Game from "../game";
import BotHooks from "../../../main/bot/botHooks";
import Games from "../../games";
import { DiscordCommandEvent } from "../../../main/events";
import { mention } from "../../../main/specialUtils";
import PresidentsMain from "./game";
import ErrorCodes from "./errors";

/**
 * Handles leaving and joining of Presidents, as long as some aliases to other 
 * components
 */
class Presidents extends Game {
    _gamePluginName: string = "presidents";
    _pluginName: string = "game." + this._gamePluginName;
    gameName: string = "Presidents";

    channelId: string;

    game: PresidentsMain;

    constructor(botHooks: BotHooks, parentPlugin: Games, channelId: string, initer: string) {
        super(botHooks, parentPlugin);

        this.gameName = "Presidents";
        this._gamePluginName = "presidents";
        this._pluginName = "game." + this._gamePluginName;

        this.channelId = channelId;
        this.game = new PresidentsMain(this.bot, this.parentPlugin, this);
        this.game.playerHandler.addPlayer(initer);
    }

    join(bot: BotHooks, event: DiscordCommandEvent, args: string) {
        let userId = event.userId;
        let result = this.game.playerHandler.addPlayer(userId);

        if (result.succeeded) {
            bot.send(event.channelId, mention(userId) + ` has joined ${this.gameName}!`);
        } else if (result.errorCode === ErrorCodes.alreadyJoined) {
            bot.send(event.channelId, mention(userId) + ", you're already in the game!");
        } else if (result.errorCode === ErrorCodes.DMAlreadyLocked) {
            bot.send(event.channelId,
                mention(userId) +
                ", you're in another game which also requires DMs!"
            );
        } else {
            bot.send(event.channelId,
                "Failed adding " + mention(userId) +
                " to game: Unknown Error."
            );
        }
    }

    leave(bot: BotHooks, event: DiscordCommandEvent, args: string) {
        let userId = event.userId;
        let result = this.game.playerHandler.removePlayer(userId);

        if (result) {
            bot.send(event.channelId, mention(userId) + " has left the game");
        } else {
            bot.send(event.channelId, mention(userId) + ", you were never in the game!");
        }
    }

    start(bot: BotHooks, event: DiscordCommandEvent, args: string) {
        this._sendStartingMessage();
        this._startGame();
    }

    listPlayers(bot: BotHooks, event: DiscordCommandEvent, args: string) {
        let players = this.game.playerHandler.players;
        let numPlayers = players.length;

        if (numPlayers === 0) {
            bot.send(event.channelId, "No one is in this game.");
        } else if (numPlayers === 1) {
            bot.send(event.channelId, "Just " + mention(players[0].userId) + ", the Loner.");
        } else {
            bot.send(event.channelId,
                players.map(e => mention(e.userId)).join(", ") +
                " (" + players.length + " players)"
            );
        }
    }

    playerUseCard(bot: BotHooks, event: DiscordCommandEvent, args: string) {
        this.game.messageHandler.onMessage(event.userId, event);
    }

    _sendStartingMessage() {
        let players: string[] = [];
        for (let player of this.game.playerHandler.players) {
            players.push(mention(player.userId));
        }

        this.bot.send(this.channelId,
            "Starting Presidents with players:\n" +
            players.join(", ")
        );
    }


    _startGame() {
        this.game.start();
    }

    _start() {
        this._registerCommand(this.commandManager, "join", this.join);
        this._registerCommand(this.commandManager, "leave", this.leave);
        this._registerCommand(this.commandManager, "start", this.start);
        
        this._registerCommand(this.commandManager, "players", this.listPlayers);
        
        this._registerCommand(this.commandManager, "use", this.playerUseCard);
        
        this._sendAboutMessage();
    }

    _sendAboutMessage() {
        const fields: object[] = [];
        const precommmand = this.parentPlugin.precommand.names[0];

        fields.push({
            name: "Commands",
            value: "**Joining**\n" +
                "Join this game by typing `" + precommmand + "join`\n" +
                "and you can leave by typing `" + precommmand + "leave`.\n" +
                "You can list all the players with `" + precommmand + "players`" +
                "There can be ### players.\n" +
                "**Starting**\n" +
                "Once all the players are in, type `" + precommmand + "start` to start the game"
        });

        this.bot.send(this.channelId, {
            embed: {
                color: this.bot.config.themeColor,
                title: this.gameName,
                description: "The ultimate social card game.",
                fields: fields
            }
        });
    }

    _stop() {
        this.game.playerHandler.removeAllPlayers();
    }
}

export default Presidents;