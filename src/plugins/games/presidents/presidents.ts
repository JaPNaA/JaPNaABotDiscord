import Game from "../game";
import BotHooks from "../../../main/bot/botHooks";
import Games from "../../games";
import { DiscordCommandEvent } from "../../../main/events";
import { mention } from "../../../main/specialUtils";
import PresidentsMain from "./game";
import { AlreadyJoinedError, DMAlreadyLockedError } from "./errors";
import MessageType from "./messageType";

/**
 * Handles leaving and joining of Presidents, as long as some aliases to other 
 * components
 */
class Presidents extends Game {
    _gamePluginName: string = "presidents";
    _pluginName: string = "game." + this._gamePluginName;
    gameName: string = "Presidents";

    initer: string;

    channelId: string;

    game: PresidentsMain;

    constructor(botHooks: BotHooks, parentPlugin: Games, channelId: string, initer: string) {
        super(botHooks, parentPlugin);

        this.gameName = "Presidents";
        this._gamePluginName = "presidents";
        this._pluginName = "game." + this._gamePluginName;

        this.initer = initer;

        this.channelId = channelId;
        this.game = new PresidentsMain(this.bot, this.parentPlugin, this);
    }

    join(bot: BotHooks, event: DiscordCommandEvent, args: string) {
        let userId = event.userId;
        this.addPlayer(userId);
    }

    silentlyAddPlayer(userId: string) {
        try {
            this.game.playerHandler.addPlayer(userId);
        } catch (err) {
            this.handleJoinError(err, userId);
        }
    }

    addPlayer(userId: string) {
        try {
            this.game.playerHandler.addPlayer(userId);
            this.bot.send(this.channelId, mention(userId) + " has joined " + this.gameName + "!");
        } catch (err) {
            this.handleJoinError(err, userId);
        }
    }

    handleJoinError(err: Error, userId: string) {
        if (err instanceof AlreadyJoinedError) {
            this.bot.send(this.channelId, mention(userId) + ", you're already in the game!");
        } else if (err instanceof DMAlreadyLockedError) {
            this.bot.send(this.channelId,
                "Failed to add " + mention(userId) +
                ". You're in another game which also requires DMs!"
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

    playerUse(bot: BotHooks, event: DiscordCommandEvent, args: string) {
        this.game.messageHandler.onMessage(event.userId, event, MessageType.use);
    }

    playerPass(bot: BotHooks, event: DiscordCommandEvent, args: string) {
        this.game.messageHandler.onMessage(event.userId, event, MessageType.pass)
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
        this._registerCommand(this.commandManager, "use", this.playerUse);
        this._registerCommand(this.commandManager, "pass", this.playerPass);
        this._sendAboutMessage();
        this.silentlyAddPlayer(this.initer);
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