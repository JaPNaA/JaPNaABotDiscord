import PresidentsMain from "./game";
import DiscordCommandEvent from "../../../main/bot/types/discordCommandEvent";
import { Rank } from "../cards/cardUtils";
import { MessageActionError, MessageSyntaxError } from "./errors";
import Player from "./player/player";

class MessageParser {
    game: PresidentsMain;

    constructor(game: PresidentsMain) {
        this.game = game;
    }

    parse_pass(player: Player, event: DiscordCommandEvent) {
        player.action.pass();
    }

    parse_use(player: Player, event: DiscordCommandEvent) {
        const cleanArgs: string | null = event.arguments && event.arguments.trim().toLowerCase();
        if (!cleanArgs) { throw new Error("Unknown Error"); }

        const [ rankArgStr, amountArgStr ] = cleanArgs.split(" ");
        const amount: number = parseInt(amountArgStr);
        const { rank, joker } = this.parseRankAction(rankArgStr);
        
        if (joker) {
            player.action.useJoker();
        } else {
            player.action.useCards(rank, amount);
        }

        player.checkDone();
    }

    private parseRankAction(rankArgStr: string) {
        let rank: Rank = Rank.ace;
        let joker: boolean = false;

        switch (rankArgStr) {
            case "1":
            case "a":
            case "ace":
                rank = Rank.ace;
                break;

            case "2":
                rank = Rank.n2;
                break;

            case "3":
                rank = Rank.n3;
                break;

            case "4":
                rank = Rank.n4;
                break;

            case "5":
                rank = Rank.n5;
                break;

            case "6":
                rank = Rank.n6;
                break;

            case "7":
                rank = Rank.n7;
                break;

            case "8":
                rank = Rank.n8;
                break;

            case "9":
                rank = Rank.n9;
                break;

            case "10":
                rank = Rank.n10;
                break;

            case "j":
            case "ja":
            case "jack":
                rank = Rank.jack;
                break;

            case "q":
            case "queen":
                rank = Rank.queen;
                break;

            case "c":
            case "kn":
            case "knight":
                rank = Rank.knight;
                break;

            case "k":
            case "ki":
            case "king":
                rank = Rank.king;
                break;

            case "jk":
            case "jo":
            case "joker":
                joker = true;
                break;

            default:
                throw new MessageSyntaxError("Unkown rank or action");
        }

        return { rank, joker };
    }
}

export default MessageParser;