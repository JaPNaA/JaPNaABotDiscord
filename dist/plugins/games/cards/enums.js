"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getEnumKeys(en) {
    return Object.keys(en)
        .map(key => en[key])
        .filter(e => typeof e === "number");
}
var Suit;
(function (Suit) {
    Suit[Suit["spades"] = 0] = "spades";
    Suit[Suit["clubs"] = 1] = "clubs";
    Suit[Suit["hearts"] = 2] = "hearts";
    Suit[Suit["diamonds"] = 3] = "diamonds";
})(Suit || (Suit = {}));
exports.Suit = Suit;
;
var Rank;
(function (Rank) {
    Rank[Rank["ace"] = 0] = "ace";
    Rank[Rank["n2"] = 1] = "n2";
    Rank[Rank["n3"] = 2] = "n3";
    Rank[Rank["n4"] = 3] = "n4";
    Rank[Rank["n5"] = 4] = "n5";
    Rank[Rank["n6"] = 5] = "n6";
    Rank[Rank["n7"] = 6] = "n7";
    Rank[Rank["n8"] = 7] = "n8";
    Rank[Rank["n9"] = 8] = "n9";
    Rank[Rank["n10"] = 9] = "n10";
    Rank[Rank["jack"] = 10] = "jack";
    Rank[Rank["queen"] = 11] = "queen";
    Rank[Rank["king"] = 12] = "king";
})(Rank || (Rank = {}));
exports.Rank = Rank;
;
const SuitKeys = getEnumKeys(Suit);
exports.SuitKeys = SuitKeys;
const RankKeys = getEnumKeys(Rank);
exports.RankKeys = RankKeys;
function suitToString(suit) {
    switch (suit) {
        case Suit.clubs:
            return "Clubs";
        case Suit.diamonds:
            return "Diamonds";
        case Suit.hearts:
            return "Hearts";
        case Suit.spades:
            return "Spades";
    }
}
exports.suitToString = suitToString;
function suitToSymbol(suit) {
    switch (suit) {
        case Suit.clubs:
            return "\u2663";
        case Suit.diamonds:
            return "\u2666";
        case Suit.hearts:
            return "\u2665";
        case Suit.spades:
            return "\u2660";
    }
}
exports.suitToSymbol = suitToSymbol;
function rankToString(rank) {
    switch (rank) {
        case Rank.ace:
            return "Ace";
        case Rank.n2:
            return "2";
        case Rank.n3:
            return "3";
        case Rank.n4:
            return "4";
        case Rank.n5:
            return "5";
        case Rank.n6:
            return "6";
        case Rank.n7:
            return "7";
        case Rank.n8:
            return "8";
        case Rank.n9:
            return "9";
        case Rank.n10:
            return "10";
        case Rank.jack:
            return "Jack";
        case Rank.queen:
            return "Queen";
        case Rank.king:
            return "King";
    }
}
exports.rankToString = rankToString;
function rankToShortString(rank) {
    switch (rank) {
        case Rank.ace:
            return "A";
        case Rank.n2:
            return "2";
        case Rank.n3:
            return "3";
        case Rank.n4:
            return "4";
        case Rank.n5:
            return "5";
        case Rank.n6:
            return "6";
        case Rank.n7:
            return "7";
        case Rank.n8:
            return "8";
        case Rank.n9:
            return "9";
        case Rank.n10:
            return "10";
        case Rank.jack:
            return "J";
        case Rank.queen:
            return "Q";
        case Rank.king:
            return "K";
    }
}
exports.rankToShortString = rankToShortString;
