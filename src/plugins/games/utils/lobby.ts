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

    private settings: LobbySettings = {};

    constructor(private parentGame: Game, private bot: Bot) {
    }

    setSettings(settings: LobbySettings) {
        this.settings = settings;
    }

    getPlayers(): Promise<string[]> {
        if (this.playersPromiseRes) {
            throw new Error("Tried to getPlayers twice");
        }
        const promise: Promise<string[]> = new Promise(res => this.playersPromiseRes = res);
        this.startLobby();
        return promise;
    }

    addPlayer(userId: string) {
        try {
            this._addPlayer(userId);
        } catch (err) {
            this.handleJoinError(err as Error, userId);
        }
    }

    removeAllPlayers() {
        if (this.settings.dmLock) {
            for (const player of this.players) {
                this.parentGame.parentPlugin._unlockDMHandle(player, this.parentGame);
            }
        }
        this.players.length = 0;
    }

    startLobby() {
        this.sendAboutMessage();

        this._registerCommand("join", this.joinCommand);
        this._registerCommand("leave", this.leaveCommand);
        this._registerCommand("start", this.startCommand);
        this._registerCommand("players", this.listPlayersCommand);
    }

    private *joinCommand(event: DiscordCommandEvent) {
        if (this.settings.maxPlayers && this.players.length >= this.settings.maxPlayers) {
            return "No more players can join -- maximum reached.";
        }
        return this.addPlayerGetAnnounceString(event.userId);
    }

    private addPlayerGetAnnounceString(userId: string) {
        try {
            this._addPlayer(userId);
            return mention(userId) + " has joined " + this.parentGame.gameName + "!";
        } catch (err) {
            this.handleJoinError(err as Error, userId);
        }
    }

    private _addPlayer(userId: string) {
        if (this.players.includes(userId)) {
            throw new AlreadyJoinedError();
        }

        if (this.settings.dmLock) {
            if (!this.parentGame.parentPlugin._isDMLockAvailable(userId)) {
                throw new DMAlreadyLockedError();
            }
            this.parentGame.parentPlugin._lockAndGetDMHandle(userId, this.parentGame);
            this.players.push(userId);
        }

        if (this.settings.autoStart) {
            if (
                (
                    this.settings.maxPlayers === undefined ||
                    this.players.length <= this.settings.maxPlayers
                ) && (
                    this.settings.minPlayers === undefined ||
                    this.players.length >= this.settings.minPlayers
                )
            ) {
                this.finishPlayerGathering();
            }
        }
    }

    private handleJoinError(err: Error, userId: string) {
        if (err instanceof AlreadyJoinedError) {
            this.bot.client.send(this.parentGame.channelId, mention(userId) + ", you're already in the game!");
        } else if (err instanceof DMAlreadyLockedError) {
            this.bot.client.send(this.parentGame.channelId,
                "Failed to add " + mention(userId) +
                ". You're in another game which also requires DMs!"
            );
        }
    }

    private *leaveCommand(event: DiscordCommandEvent) {
        if (!this.players.includes(event.userId)) {
            return mention(event.userId) + ", you were never in the game!";
        }

        if (this.settings.dmLock) {
            this.parentGame.parentPlugin._unlockDMHandle(event.userId, this.parentGame);
        }

        removeFromArray(this.players, event.userId);
        return mention(event.userId) + " has left the game";
    }

    private *listPlayersCommand() {
        let numPlayers = this.players.length;

        if (numPlayers === 0) {
            return "No one is in this game.";
        } else if (numPlayers === 1) {
            return "Just " + mention(this.players[0]) + ", the Loner.";
        } else {
            return this.players.map(e => mention(e)).join(", ") +
                " (" + numPlayers + " players)";
        }
    }

    private *startCommand() {
        const { maxPlayers, minPlayers } = this.settings;
        if (maxPlayers !== undefined && this.players.length > maxPlayers) {
            return `There are too many players. (Max is ${maxPlayers})`;
        }
        if (minPlayers !== undefined && this.players.length < minPlayers) {
            return `There are few players. (Min is ${minPlayers})`;
        }

        this.finishPlayerGathering();

        return `Starting ${this.parentGame.gameName} with players:\n` +
            this.players.map(id => mention(id)).join(", ");
    }

    private finishPlayerGathering() {
        this.stopLobby();
        if (this.playersPromiseRes) {
            this.playersPromiseRes(this.players);
        }
    }

    private sendAboutMessage() {
        const { maxPlayers, minPlayers } = this.settings;
        const fields: EmbedFieldData[] = [];
        const precommmand = this.parentGame.parentPlugin.precommand.names[0];
        let numPlayersLimit: string = "??";

        if (maxPlayers === undefined && minPlayers === undefined) {
            numPlayersLimit = "any number of";
        } else if (maxPlayers !== undefined && minPlayers !== undefined) {
            if (maxPlayers == minPlayers) {
                numPlayersLimit = maxPlayers.toString();
            } else {
                numPlayersLimit = minPlayers + " to " + maxPlayers;
            }
        } else if (minPlayers !== undefined) {
            numPlayersLimit = minPlayers + "+";
        } else if (maxPlayers !== undefined) {
            numPlayersLimit = maxPlayers + " or fewer";
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
            description: this.settings.description,
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

interface LobbySettings {
    minPlayers?: number;
    maxPlayers?: number;

    /**
     * Description of the game
     */
    description?: string;

    /**
     * Does the game require players to use their DMs?
     */
    dmLock?: boolean;

    /**
     * Start as soon as enough players join?
     * (Instead of waiting for the `start` command?)
     */
    autoStart?: boolean;
}

class DMAlreadyLockedError extends Error {
    constructor() {
        super("DMs are already locked");
    }
}

class AlreadyJoinedError extends Error {
    constructor() {
        super("Player has already joined");
    }
}

export default Lobby;
