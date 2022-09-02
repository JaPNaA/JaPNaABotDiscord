import Game from "../game";
import Bot from "../../../main/bot/bot/bot";
import Games from "../../games";
import DiscordCommandEvent from "../../../main/bot/events/discordCommandEvent";
import PresidentsMain from "./game";
import MessageType from "./messageType";
import Lobby from "../utils/lobby";

/**
 * Handles leaving and joining of Presidents, as long as some aliases to other 
 * components
 */
class Presidents extends Game {
    _gamePluginName: string = "presidents";
    pluginName: string = "game." + this._gamePluginName;
    gameName: string = "Presidents";

    initer: string;

    game: PresidentsMain;
    lobby: Lobby = new Lobby(this, this.bot);

    constructor(bot: Bot, parentPlugin: Games, channelId: string, initer: string) {
        super(bot, parentPlugin, channelId);

        this.gameName = "Presidents";
        this._gamePluginName = "presidents";
        this.pluginName = "game." + this._gamePluginName;

        this.initer = initer;
        this.lobby.setSettings({
            minPlayers: 1,
            description: "The ultimate social card game.",
            dmLock: true
        });

        this.game = new PresidentsMain(this.bot, this.parentPlugin, this);
    }

    *playerUse(event: DiscordCommandEvent) {
        this.game.messageHandler.onMessage(event.userId, event, MessageType.use);
    }

    *playerPass(event: DiscordCommandEvent) {
        this.game.messageHandler.onMessage(event.userId, event, MessageType.pass);
    }

    _startGame() {
        this.game.start();
    }

    async _start() {
        this._registerCommand(this.commandManager, "use", this.playerUse);
        this._registerCommand(this.commandManager, "pass", this.playerPass);
        this.lobby.addPlayer(this.initer);
        
        const players = await this.lobby.getPlayers();
        for (const player of players) {
            this.game.playerHandler.addPlayer(player);
        }
    }

    _stop() {
        this.lobby.removeAllPlayers();
    }
}

export default Presidents;