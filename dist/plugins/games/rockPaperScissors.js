"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RockPaperScissors = void 0;
const mention_1 = __importDefault(require("../../main/utils/str/mention"));
const game_1 = __importDefault(require("./game"));
const lobby_1 = __importDefault(require("./utils/lobby"));
class RockPaperScissors extends game_1.default {
    lobby;
    choices = new Map();
    constructor(bot, parentPlugin, channelId, initer) {
        super(bot, parentPlugin, channelId);
        this.gameName = "Rock Paper Scissors";
        this.lobby = new lobby_1.default(this, bot);
        this.lobby.setSettings({
            description: "Rock beats scissors, scissors beat paper, and paper beats rock.",
            dmLock: true,
            maxPlayers: 2,
            minPlayers: 2,
            autoStart: true
        });
        this.lobby.addPlayer(initer);
    }
    _start() {
        this.lobby.getPlayers()
            .then(players => this.requestChoice(players));
    }
    requestChoice(players) {
        const message = `Make a choice!
- \`${this.parentPlugin.precommand}use rock\`
- \`${this.parentPlugin.precommand}use paper\`
- \`${this.parentPlugin.precommand}use scissors\``;
        this._registerCommand(this.commandManager, "use", this.useCommand);
        for (const player of players) {
            this.bot.client.sendDM(player, message);
        }
    }
    useCommand(event) {
        let choice;
        const char = event.arguments[0].toLowerCase();
        switch (char) {
            case "r":
                choice = RPS.rock;
                break;
            case "p":
                choice = RPS.paper;
                break;
            case "s":
                choice = RPS.scissors;
                break;
            default:
                throw new Error("Unknown choice");
        }
        this.choices.set(event.userId, choice);
        if (this.choices.size >= 2) {
            this.checkWinners();
        }
        else {
            this.bot.client.send(event.channelId, "Choice recorded. Waiting for opponent..." +
                (event.isDM ? "" : "\n(Also, you should probably make your choice in DMs)"));
        }
    }
    checkWinners() {
        const [[playerA, choiceA], [playerB, choiceB]] = this.choices.entries();
        let winner;
        switch (choiceA) {
            case RPS.rock:
                switch (choiceB) {
                    case RPS.rock:
                        break;
                    case RPS.paper:
                        winner = playerB;
                        break;
                    case RPS.scissors:
                        winner = playerA;
                        break;
                }
                break;
            case RPS.paper:
                switch (choiceB) {
                    case RPS.rock:
                        winner = playerA;
                        break;
                    case RPS.paper:
                        break;
                    case RPS.scissors:
                        winner = playerB;
                        break;
                }
                break;
            case RPS.scissors:
                switch (choiceB) {
                    case RPS.rock:
                        winner = playerB;
                        break;
                    case RPS.paper:
                        winner = playerA;
                        break;
                    case RPS.scissors:
                        break;
                }
                break;
        }
        let message = `${(0, mention_1.default)(playerA)} uses ${RPSStringMap[choiceA]}\n` +
            `${(0, mention_1.default)(playerB)} uses ${RPSStringMap[choiceB]}\n`;
        if (winner) {
            message += `**${(0, mention_1.default)(winner)} wins!**`;
        }
        else {
            message += "It's a draw!";
        }
        this.bot.client.send(this.channelId, message);
    }
    _stop() {
        this.lobby.removeAllPlayers();
    }
}
exports.RockPaperScissors = RockPaperScissors;
var RPS;
(function (RPS) {
    RPS[RPS["rock"] = 0] = "rock";
    RPS[RPS["paper"] = 1] = "paper";
    RPS[RPS["scissors"] = 2] = "scissors";
})(RPS || (RPS = {}));
;
const RPSStringMap = {
    [RPS.rock]: "rock", [RPS.paper]: "paper", [RPS.scissors]: "scissors"
};
