import Game from "../../games/game";
import Bot from "../../../main/bot/bot/bot";
import Games from "../../games";
import Lobby from "../utils/lobby";
import ChessBoard from "./chessBoard";
import CommandParser from "./commandParser";
import DiscordCommandEvent from "../../../main/bot/events/discordCommandEvent";

class Chess extends Game {
    _gamePluginName: string = "chess"
    pluginName: string = "game." + this._gamePluginName;
    gameName: string = "Chess";

    gameEnded: boolean = false;

    private lobby = new Lobby(this, this.bot);
    private board = new ChessBoard();
    private commandParser = new CommandParser(this.board);

    constructor(botHooks: Bot, parentPlugin: Games, channelId: string, private initer: string) {
        super(botHooks, parentPlugin, channelId);
        this.lobby.setSettings({
            maxPlayers: 2,
            minPlayers: 2,
            description: "Abstract strategy game involving no hidden information. It is played on a square chessboard with 64 squares arranged in an eight-by-eight grid."
        });
    }

    execCommand(event: DiscordCommandEvent) {
        const moves = event.arguments.split(/\s+/);

        for (const move of moves) {
            this.commandParser.tryExec(move);
            console.log(this.board.toString());
            console.log(this.board.history.toString());
        }

        this._sendBoard();
    }

    _sendBoard() {
        this.bot.client.send(this.channelId, "```" + this.board.toString() + "```");
    }

    async _start() {
        // this.bot.client.send(this.channelId, "Chess lobby started.");
        // console.log(await this.lobby.getPlayers());
        // this.lobby.addPlayer(this.initer);
        this._registerCommand(this.commandManager, "exec", this.execCommand);
        this._registerCommand(this.commandManager, "board", () => this._sendBoard());
        this._registerCommand(this.commandManager, "undo", () => {
            this.board.undo();
            this._sendBoard();
        });
        this._registerCommand(this.commandManager, "history", () => {
            this.bot.client.send(this.channelId, this.board.history.toString());
        });
    }


    _stop() {
        this.lobby.removeAllPlayers();
    }
}

export default Chess;