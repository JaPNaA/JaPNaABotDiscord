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
    Suit[Suit["hearts"] = 1] = "hearts";
    Suit[Suit["diamonds"] = 2] = "diamonds";
    Suit[Suit["clubs"] = 3] = "clubs";
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
    Rank[Rank["knight"] = 11] = "knight";
    Rank[Rank["queen"] = 12] = "queen";
    Rank[Rank["king"] = 13] = "king";
})(Rank || (Rank = {}));
exports.Rank = Rank;
;
const SuitKeys = getEnumKeys(Suit);
exports.SuitKeys = SuitKeys;
const RankKeys = getEnumKeys(Rank);
exports.RankKeys = RankKeys;
function suitToString(suit) {
    switch (suit) {
        case Suit.spades:
            return "Spades";
        case Suit.diamonds:
            return "Diamonds";
        case Suit.hearts:
            return "Hearts";
        case Suit.clubs:
            return "Clubs";
    }
}
exports.suitToString = suitToString;
function suitToSymbol(suit) {
    switch (suit) {
        case Suit.spades:
            return "\u2660";
        case Suit.diamonds:
            return "\u2666";
        case Suit.hearts:
            return "\u2665";
        case Suit.clubs:
            return "\u2663";
    }
}
exports.suitToSymbol = suitToSymbol;
function suitToInt(suit) {
    switch (suit) {
        case Suit.spades:
            return 0xA;
        case Suit.hearts:
            return 0xB;
        case Suit.diamonds:
            return 0xC;
        case Suit.clubs:
            return 0xD;
    }
}
exports.suitToInt = suitToInt;
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
        case Rank.knight:
            return "Knight";
        case Rank.queen:
            return "Queen";
        case Rank.king:
            return "King";
    }
}
exports.rankToString = rankToString;
function rankToInt(rank) {
    switch (rank) {
        case Rank.ace:
            return 0x1;
        case Rank.n2:
            return 0x2;
        case Rank.n3:
            return 0x3;
        case Rank.n4:
            return 0x4;
        case Rank.n5:
            return 0x5;
        case Rank.n6:
            return 0x6;
        case Rank.n7:
            return 0x7;
        case Rank.n8:
            return 0x8;
        case Rank.n9:
            return 0x9;
        case Rank.n10:
            return 0xA;
        case Rank.jack:
            return 0xB;
        case Rank.knight:
            return 0xC;
        case Rank.queen:
            return 0xD;
        case Rank.king:
            return 0xE;
    }
}
exports.rankToInt = rankToInt;
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
        case Rank.knight:
            return "C";
        case Rank.queen:
            return "Q";
        case Rank.king:
            return "K";
    }
}
exports.rankToShortString = rankToShortString;
function toSymbol(suit, rank) {
    let firstChar = 0xD83C;
    let secondChar = 0xDC00 +
        suitToInt(suit) * 0x10 +
        rankToInt(rank);
    return String.fromCharCode(firstChar, secondChar);
}
exports.toSymbol = toSymbol;
