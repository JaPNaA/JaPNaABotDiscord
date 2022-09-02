import Game from "../../games/game";
import Bot from "../../../main/bot/bot/bot";
import Games from "../../games";
import Lobby from "../utils/lobby";
import ChessBoard from "./chessBoard";
import CommandParser from "./commandParser";
import { ChessError } from "./errors";
import mention from "../../../main/utils/str/mention";
import { DeleteMessageSoft, ReplyPrivate, SendPrivate } from "../../../main/bot/actions/actions";

class Chess extends Game {
    _gamePluginName: string = "chess"
    pluginName: string = "game." + this._gamePluginName;
    gameName: string = "Chess";

    gameEnded: boolean = false;

    private lobby = new Lobby(this, this.bot);
    private players: string[] = [];

    private settings = {
        /** controls if this.players[0] plays black or white */
        boardFlipped: false,
        /** hide the board from players? */
        blindfolded: false,
        /** delete move execution command messages */
        deleteHistory: false
    };
    /** Used for settings.deleteHistory; deleting last history */
    private lastCommandMessageId?: string;

    private board = new ChessBoard();
    private commandParser = new CommandParser(this.board);

    constructor(botHooks: Bot, parentPlugin: Games, channelId: string, private initer: string) {
        super(botHooks, parentPlugin, channelId);
        this.lobby.setSettings({
            minPlayers: 1,
            maxPlayers: 2,
            description: "Abstract strategy game involving no hidden information. It is played on a square chessboard with 64 squares arranged in an eight-by-eight grid.",
            dmLock: true
        });
    }

    async *_exec(userId: string, messageId: string, command: string) {
        if (!this._isTurn(userId)) {
            return "It is not your turn";
        }

        try {
            this.commandParser.tryExec(command);

            // if settings.deleteHistory, delete last message that triggered _exec
            if (this.lastCommandMessageId && this.settings.deleteHistory) {
                yield new DeleteMessageSoft(this.channelId, this.lastCommandMessageId);
            }

            this.lastCommandMessageId = messageId;
            return this._boardToString();
        } catch (err) {
            return this._errorToString(err, this.channelId);
        }
    }

    _boardToString() {
        const boardString = "```" + this.board.toString() + "```";
        return this.settings.blindfolded ? (
            this.board.blackTurn ? "Black's turn" : "White's turn"
        ) : boardString;
    }

    _errorToString(error: any, channelId: string) {
        if (error instanceof ChessError) {
            return "Error: " + error.message;
        } else {
            throw error;
        }
    }

    _isTurn(userId: string) {
        if (!this._isPlayer(userId)) { return false; }
        if (this.players.length <= 1) { return true; }
        return ((this.players.indexOf(userId) === 0) !== this.board.blackTurn) !== this.settings.boardFlipped;
    }

    _getWhitePlayer() {
        if (this.players.length < 2) { return this.players[0]; }
        return this.settings.boardFlipped ? this.players[1] : this.players[0];
    }

    _getBlackPlayer() {
        if (this.players.length < 2) { return this.players[0]; }
        return this.settings.boardFlipped ? this.players[0] : this.players[1];
    }

    _isPlayer(userId: string) {
        return this.players.includes(userId);
    }

    async _start() {
        this.lobby.addPlayer(this.initer);
        this.players = await this.lobby.getPlayers();

        const precommand = this.parentPlugin.precommand.names[0];
        await this.bot.client.send(this.channelId,
            `${mention(this._getWhitePlayer())} plays white,\n` +
            `${mention(this._getBlackPlayer())} plays black.\n` +
            `Do \`${precommand}MOVE\` or \`${precommand}exec MOVE\` to make a move (ex. \`${precommand}e4\` \`${precommand}exec nc3\`)\n` +
            `Before starting the game you can \`${precommand}flip board\`, \`${precommand}blindfold\`, and \`${precommand}hide history\`\n` +
            `During the game, you can ask for the \`${precommand}board\` and \`${precommand}history\`\n` +
            `You can take back moves with \`${precommand}undo\`.`
        );
        this._boardToString();

        this._registerCommand(this.commandManager, "exec", event => {
            return this._exec(event.userId, event.messageId, event.arguments);
        });
        this._registerUnknownCommandHandler(this.commandManager,
            event => this._exec(event.userId, event.messageId, event.commandContent)
        );

        this._registerCommand(this.commandManager, "flip board", function* (this: Chess, event) {
            if (!this._isPlayer(event.userId)) { return; }
            if (this.players.length < 2) {
                return "You don't need to flip the board in singleplayer";
            }
            if (this.board.history.getLastMove()) {
                return "Cannot flip board in the middle of the game.";
            }
            this.settings.boardFlipped = !this.settings.boardFlipped;
            return `${mention(this._getWhitePlayer())} now plays white,\n` +
                `${mention(this._getBlackPlayer())} now plays black`;
        });

        this._registerCommand(this.commandManager, "blindfold", function* (this: Chess, event) {
            if (!this._isPlayer(event.userId)) { return; }
            this.settings.blindfolded = !this.settings.blindfolded;

            return this.settings.blindfolded ?
                "Hiding board" : "Showing board"
        });

        this._registerCommand(this.commandManager, "hide history", function* (this: Chess, event) {
            if (!this._isPlayer(event.userId)) { return; }
            this.settings.deleteHistory = !this.settings.deleteHistory;

            return this.settings.deleteHistory ?
                "Hiding history" : "Not hiding history";
        })

        this._registerCommand(this.commandManager, "board", async function* (this: Chess, event) {
            if (this._isPlayer(event.userId) || !this.settings.blindfolded) {
                return this._boardToString();
            } else if (this.settings.blindfolded) {
                return new ReplyPrivate("Players are blindfolded.\n```" + this.board.toString() + "```");
            }
        });

        this._registerCommand(this.commandManager, "undo", function* (this: Chess, event) {
            if (!this._isPlayer(event.userId)) { return; }
            this.board.undo();
            return this._boardToString();
        });

        this._registerCommand(this.commandManager, "history", async function* (this: Chess, event) {
            if (this.settings.deleteHistory) {
                if (this._isPlayer(event.userId)) {
                    return "History is hidden";
                } else {
                    return new ReplyPrivate("Players can't view history.\n" + this.board.history.toString());
                }
            } else {
                return this.board.history.toString();
            }
        });
    }

    _stop() {
        this.lobby.removeAllPlayers();
    }
}

export default Chess;