import Bot from "../../main/bot/bot/bot";
import DiscordCommandEvent from "../../main/bot/events/discordCommandEvent";
import mention from "../../main/utils/str/mention";
import Games from "../games";
import Game from "./game";
import Lobby from "./utils/lobby";

export class RockPaperScissors extends Game {
    public lobby: Lobby;
    private choices: Map<string, RPS> = new Map();

    constructor(bot: Bot, parentPlugin: Games, channelId: string, private initer: string) {
        super(bot, parentPlugin, channelId);
        this.gameName = "Rock Paper Scissors";
        this.lobby = new Lobby(this, bot);
        this.lobby.setSettings({
            description: "Rock beats scissors, scissors beat paper, and paper beats rock.",
            dmLock: true,
            maxPlayers: 2,
            minPlayers: 2,
            autoStart: true
        });
    }

    _start() {
        this.lobby.addPlayer(this.initer);
        this.lobby.getPlayers()
            .then(players => this.requestChoice(players));
    }

    private requestChoice(players: string[]) {
        const message = `Make a choice!
- \`${this.parentPlugin.precommand}use rock\`
- \`${this.parentPlugin.precommand}use paper\`
- \`${this.parentPlugin.precommand}use scissors\``;

        this._registerCommand(this.commandManager, "use", this.useCommand);

        for (const player of players) {
            this.bot.client.sendDM(player, message);
        }
    }

    private useCommand(event: DiscordCommandEvent) {
        let choice: RPS;
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
        } else {
            this.bot.client.send(event.channelId,
                "Choice recorded. Waiting for opponent..." +
                (event.isDM ? "" : "\n(Also, you should probably make your choice in DMs)")
            );
        }
    }

    private checkWinners() {
        const [[playerA, choiceA], [playerB, choiceB]] = this.choices.entries();

        let winner: string | undefined;

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

        let message =
            `${mention(playerA)} uses ${RPSStringMap[choiceA]}\n` +
            `${mention(playerB)} uses ${RPSStringMap[choiceB]}\n`;

        if (winner) {
            message += `**${mention(winner)} wins!**`;
        } else {
            message += "It's a draw!";
        }

        this.bot.client.send(this.channelId, message);
    }

    _stop() {
        this.lobby.removeAllPlayers();
    }
}

enum RPS {
    rock, paper, scissors
};

const RPSStringMap = {
    [RPS.rock]: "rock", [RPS.paper]: "paper", [RPS.scissors]: "scissors"
};
