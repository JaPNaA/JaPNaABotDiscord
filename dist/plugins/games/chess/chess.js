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
const mention_1 = __importDefault(require("../../../main/utils/str/mention"));
const actions_1 = require("../../../main/bot/actions/actions");
class Chess extends game_1.default {
    initer;
    _gamePluginName = "chess";
    pluginName = "game." + this._gamePluginName;
    gameName = "Chess";
    gameEnded = false;
    lobby = new lobby_1.default(this, this.bot);
    players = [];
    settings = {
        /** controls if this.players[0] plays black or white */
        boardFlipped: false,
        /** hide the board from players? */
        blindfolded: false,
        /** delete move execution command messages */
        deleteHistory: false
    };
    /** Used for settings.deleteHistory; deleting last history */
    lastCommandMessageId;
    board = new chessBoard_1.default();
    commandParser = new commandParser_1.default(this.board);
    constructor(botHooks, parentPlugin, channelId, initer) {
        super(botHooks, parentPlugin, channelId);
        this.initer = initer;
        this.lobby.setSettings({
            minPlayers: 1,
            maxPlayers: 2,
            description: "Abstract strategy game involving no hidden information. It is played on a square chessboard with 64 squares arranged in an eight-by-eight grid.",
            dmLock: true
        });
    }
    async *_exec(userId, messageId, command) {
        if (!this._isTurn(userId)) {
            return "It is not your turn";
        }
        try {
            this.commandParser.tryExec(command);
            // if settings.deleteHistory, delete last message that triggered _exec
            if (this.lastCommandMessageId && this.settings.deleteHistory) {
                yield new actions_1.DeleteMessageSoft(this.channelId, this.lastCommandMessageId);
            }
            this.lastCommandMessageId = messageId;
            return this._boardToString();
        }
        catch (err) {
            return this._errorToString(err, this.channelId);
        }
    }
    _boardToString() {
        const boardString = "```" + this.board.toString() + "```";
        return this.settings.blindfolded ? (this.board.blackTurn ? "Black's turn" : "White's turn") : boardString;
    }
    _errorToString(error, channelId) {
        if (error instanceof errors_1.ChessError) {
            return "Error: " + error.message;
        }
        else {
            throw error;
        }
    }
    _isTurn(userId) {
        if (!this._isPlayer(userId)) {
            return false;
        }
        if (this.players.length <= 1) {
            return true;
        }
        return ((this.players.indexOf(userId) === 0) !== this.board.blackTurn) !== this.settings.boardFlipped;
    }
    _getWhitePlayer() {
        if (this.players.length < 2) {
            return this.players[0];
        }
        return this.settings.boardFlipped ? this.players[1] : this.players[0];
    }
    _getBlackPlayer() {
        if (this.players.length < 2) {
            return this.players[0];
        }
        return this.settings.boardFlipped ? this.players[0] : this.players[1];
    }
    _isPlayer(userId) {
        return this.players.includes(userId);
    }
    async _start() {
        this.lobby.addPlayer(this.initer);
        this.players = await this.lobby.getPlayers();
        const precommand = this.parentPlugin.precommand.names[0];
        await this.bot.client.send(this.channelId, `${(0, mention_1.default)(this._getWhitePlayer())} plays white,\n` +
            `${(0, mention_1.default)(this._getBlackPlayer())} plays black.\n` +
            `Do \`${precommand}MOVE\` or \`${precommand}exec MOVE\` to make a move (ex. \`${precommand}e4\` \`${precommand}exec nc3\`)\n` +
            `Before starting the game you can \`${precommand}flip board\`, \`${precommand}blindfold\`, and \`${precommand}hide history\`\n` +
            `During the game, you can ask for the \`${precommand}board\` and \`${precommand}history\`\n` +
            `You can take back moves with \`${precommand}undo\`.`);
        this._boardToString();
        this._registerCommand(this.commandManager, "exec", event => {
            return this._exec(event.userId, event.messageId, event.arguments);
        });
        this._registerUnknownCommandHandler(this.commandManager, event => this._exec(event.userId, event.messageId, event.commandContent));
        this._registerCommand(this.commandManager, "flip board", function* (event) {
            if (!this._isPlayer(event.userId)) {
                return;
            }
            if (this.players.length < 2) {
                return "You don't need to flip the board in singleplayer";
            }
            if (this.board.history.getLastMove()) {
                return "Cannot flip board in the middle of the game.";
            }
            this.settings.boardFlipped = !this.settings.boardFlipped;
            return `${(0, mention_1.default)(this._getWhitePlayer())} now plays white,\n` +
                `${(0, mention_1.default)(this._getBlackPlayer())} now plays black`;
        });
        this._registerCommand(this.commandManager, "blindfold", function* (event) {
            if (!this._isPlayer(event.userId)) {
                return;
            }
            this.settings.blindfolded = !this.settings.blindfolded;
            return this.settings.blindfolded ?
                "Hiding board" : "Showing board";
        });
        this._registerCommand(this.commandManager, "hide history", function* (event) {
            if (!this._isPlayer(event.userId)) {
                return;
            }
            this.settings.deleteHistory = !this.settings.deleteHistory;
            return this.settings.deleteHistory ?
                "Hiding history" : "Not hiding history";
        });
        this._registerCommand(this.commandManager, "board", async function* (event) {
            if (this._isPlayer(event.userId) || !this.settings.blindfolded) {
                return this._boardToString();
            }
            else if (this.settings.blindfolded) {
                return new actions_1.ReplyPrivate("Players are blindfolded.\n```" + this.board.toString() + "```");
            }
        });
        this._registerCommand(this.commandManager, "undo", function* (event) {
            if (!this._isPlayer(event.userId)) {
                return;
            }
            this.board.undo();
            return this._boardToString();
        });
        this._registerCommand(this.commandManager, "history", async function* (event) {
            if (this.settings.deleteHistory) {
                if (this._isPlayer(event.userId)) {
                    return "History is hidden";
                }
                else {
                    return new actions_1.ReplyPrivate("Players can't view history.\n" + this.board.history.toString());
                }
            }
            else {
                return this.board.history.toString();
            }
        });
    }
    _stop() {
        this.lobby.removeAllPlayers();
    }
}
exports.default = Chess;
