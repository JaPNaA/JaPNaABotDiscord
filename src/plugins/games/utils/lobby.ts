import { EmbedFieldData } from "discord.js";
import Bot from "../../../main/bot/bot/bot";
import BotCommandCallback from "../../../main/bot/command/commandCallback";
import DiscordCommandEvent from "../../../main/bot/events/discordCommandEvent";
import removeFromArray from "../../../main/utils/removeFromArray";
import mention from "../../../main/utils/str/mention";
import Game from "../game";

class Lobby {
    private players: string[] = [];
    private registeredCommandNames: string[] = [];
    private playersPromiseRes?: (val: string[]) => any;

    private minPlayers?: number;
    private maxPlayers?: number;
    private description?: string;

    constructor(private parentGame: Game, private bot: Bot) {
    }

    setSettings({ minPlayers, maxPlayers, description }: {
        minPlayers?: number,
        maxPlayers?: number,
        description?: string
    }) {
        this.minPlayers = minPlayers;
        this.maxPlayers = maxPlayers;
        this.description = description;
    }

    addPlayer(player: string) {
        if (!this.players.includes(player)) {
            this.players.push(player);
        }
    }

    getPlayers(): Promise<string[]> {
        if (this.playersPromiseRes) {
            throw new Error("Tried to getPlayers twice");
        }
        const promise: Promise<string[]> = new Promise(res => this.playersPromiseRes = res);
        this.startLobby();
        return promise;
    }

    private joinCommand(event: DiscordCommandEvent) {
        if (this.players.includes(event.userId)) {
            this.bot.client.send(event.channelId, mention(event.userId) + ", you're already in the game!");
            return;
        }
        if (this.maxPlayers && this.players.length >= this.maxPlayers) {
            this.bot.client.send(event.channelId, "No more players can join -- maximum reached.");
        }
        this.players.push(event.userId);
        this.bot.client.send(event.channelId, mention(event.userId) + " has joined the game!");
    }

    private leaveCommand(event: DiscordCommandEvent) {
        if (!this.players.includes(event.userId)) {
            this.bot.client.send(event.channelId, mention(event.userId) + ", you were never in the game!");
            return;
        }
        removeFromArray(this.players, event.userId);
        this.bot.client.send(event.channelId, mention(event.userId) + " has left the game");
    }

    private listPlayersCommand(event: DiscordCommandEvent) {
        let numPlayers = this.players.length;

        if (numPlayers === 0) {
            this.bot.client.send(event.channelId, "No one is in this game.");
        } else if (numPlayers === 1) {
            this.bot.client.send(event.channelId, "Just " + mention(this.players[0]) + ", the Loner.");
        } else {
            this.bot.client.send(event.channelId,
                this.players.map(e => mention(e)).join(", ") +
                " (" + numPlayers + " players)"
            );
        }
    }

    private startCommand(event: DiscordCommandEvent) {
        if (this.maxPlayers !== undefined && this.players.length > this.maxPlayers) {
            this.bot.client.send(event.channelId, `There are too many players. (Max is ${this.maxPlayers})`);
            return;
        }
        if (this.minPlayers !== undefined && this.players.length < this.minPlayers) {
            this.bot.client.send(event.channelId, `There are few players. (Min is ${this.minPlayers})`);
            return;
        }

        this.stopLobby();
        if (this.playersPromiseRes) {
            this.playersPromiseRes(this.players);
        }
    }

    startLobby() {
        this.sendAboutMessage();

        this._registerCommand("join", this.joinCommand);
        this._registerCommand("leave", this.leaveCommand);
        this._registerCommand("start", this.startCommand);
        this._registerCommand("players", this.listPlayersCommand);
    }

    private sendAboutMessage() {
        const fields: EmbedFieldData[] = [];
        const precommmand = this.parentGame.parentPlugin.precommand.names[0];
        let numPlayersLimit: string = "??";

        if (this.maxPlayers === undefined && this.minPlayers === undefined) {
            numPlayersLimit = "any number of";
        } else if (this.maxPlayers !== undefined && this.minPlayers !== undefined) {
            if (this.maxPlayers == this.minPlayers) {
                numPlayersLimit = this.maxPlayers.toString();
            } else {
                numPlayersLimit = this.minPlayers + " to " + this.maxPlayers;
            }
        } else if (this.minPlayers !== undefined) {
            numPlayersLimit = this.minPlayers + "+";
        } else if (this.maxPlayers !== undefined) {
            numPlayersLimit = this.maxPlayers + " or fewer";
        }

        fields.push({
            name: "Lobby Commands",
            value: "**Joining**\n" +
                "Join this game by typing `" + precommmand + "join`\n" +
                "and you can leave by typing `" + precommmand + "leave`.\n" +
                "You can list all the players with `" + precommmand + "players`" +
                "There can be " + numPlayersLimit + " players.\n" +
                "**Starting**\n" +
                "Once all the players are in, type `" + precommmand + "start` to start the game"
        });

        this.bot.client.sendEmbed(this.parentGame.channelId, {
            color: this.bot.config.themeColor,
            title: this.parentGame.gameName,
            description: this.description,
            fields: fields
        });
    }

    stopLobby() {
        for (const command of this.registeredCommandNames) {
            this.parentGame.commandManager.unregister(command);
        }
    }

    _registerCommand(name: string, callback: BotCommandCallback) {
        this.parentGame.commandManager.register(name, this.parentGame.pluginName, callback.bind(this));
        this.registeredCommandNames.push(name);
    }
}

export default Lobby;
