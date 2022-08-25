"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const game_1 = __importDefault(require("../../games/game"));
const lobby_1 = __importDefault(require("../utils/lobby"));
const chessBoard_1 = __importDefault(require("./chessBoard"));
const commandParser_1 = __importDefault(require("./commandParser"));
const errors_1 = require("./errors");
class Chess extends game_1.default {
    initer;
    _gamePluginName = "chess";
    pluginName = "game." + this._gamePluginName;
    gameName = "Chess";
    gameEnded = false;
    lobby = new lobby_1.default(this, this.bot);
    board = new chessBoard_1.default();
    commandParser = new commandParser_1.default(this.board);
    constructor(botHooks, parentPlugin, channelId, initer) {
        super(botHooks, parentPlugin, channelId);
        this.initer = initer;
        this.lobby.setSettings({
            maxPlayers: 2,
            minPlayers: 2,
            description: "Abstract strategy game involving no hidden information. It is played on a square chessboard with 64 squares arranged in an eight-by-eight grid."
        });
    }
    execCommand(event) {
        try {
            const moves = event.arguments.split(/\s+/);
            for (const move of moves) {
                this.commandParser.tryExec(move);
            }
            this._sendBoard();
        }
        catch (err) {
            this._sendError(err, event.channelId);
        }
    }
    _sendBoard() {
        this.bot.client.send(this.channelId, "```" + this.board.toString() + "```");
    }
    _sendError(error, channelId) {
        if (error instanceof errors_1.ChessError) {
            this.bot.client.send(channelId, "Error: " + error.message);
        }
        else {
            throw error;
        }
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
        this._registerUnknownCommandHandler(this.commandManager, event => {
            try {
                this.commandParser.tryExec(event.commandContent);
                this._sendBoard();
            }
            catch (err) {
                this._sendError(err, event.channelId);
            }
        });
    }
    _stop() {
        this.lobby.removeAllPlayers();
    }
}
exports.default = Chess;
