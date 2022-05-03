"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cardUtils_1 = require("../utils/cards/cardUtils");
const errors_1 = require("./errors");
class MessageParser {
    game;
    constructor(game) {
        this.game = game;
    }
    parse_pass(player, event) {
        player.action.pass();
    }
    parse_use(player, event) {
        const cleanArgs = event.arguments && event.arguments.trim().toLowerCase();
        if (!cleanArgs) {
            throw new Error("Unknown Error");
        }
        const [rankArgStr, amountArgStr] = cleanArgs.split(" ");
        const amount = parseInt(amountArgStr);
        const { rank, joker } = this.parseRankAction(rankArgStr);
        if (joker) {
            player.action.useJoker();
        }
        else {
            player.action.useCards(rank, amount);
        }
        player.checkDone();
    }
    parseRankAction(rankArgStr) {
        let rank = cardUtils_1.Rank.ace;
        let joker = false;
        switch (rankArgStr) {
            case "1":
            case "a":
            case "ace":
                rank = cardUtils_1.Rank.ace;
                break;
            case "2":
                rank = cardUtils_1.Rank.n2;
                break;
            case "3":
                rank = cardUtils_1.Rank.n3;
                break;
            case "4":
                rank = cardUtils_1.Rank.n4;
                break;
            case "5":
                rank = cardUtils_1.Rank.n5;
                break;
            case "6":
                rank = cardUtils_1.Rank.n6;
                break;
            case "7":
                rank = cardUtils_1.Rank.n7;
                break;
            case "8":
                rank = cardUtils_1.Rank.n8;
                break;
            case "9":
                rank = cardUtils_1.Rank.n9;
                break;
            case "10":
                rank = cardUtils_1.Rank.n10;
                break;
            case "j":
            case "ja":
            case "jack":
                rank = cardUtils_1.Rank.jack;
                break;
            case "q":
            case "queen":
                rank = cardUtils_1.Rank.queen;
                break;
            case "c":
            case "kn":
            case "knight":
                rank = cardUtils_1.Rank.knight;
                break;
            case "k":
            case "ki":
            case "king":
                rank = cardUtils_1.Rank.king;
                break;
            case "jk":
            case "jo":
            case "joker":
                joker = true;
                break;
            default:
                throw new errors_1.MessageSyntaxError("Unkown rank or action");
        }
        return { rank, joker };
    }
}
exports.default = MessageParser;
