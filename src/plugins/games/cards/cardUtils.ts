function getEnumKeys<T>(en: any): T[] {
    return Object.keys(en)
        .map(key => en[key])
        .filter(e => typeof e === "number")
}

enum Suit {
    spades, hearts, diamonds, clubs
};

enum Rank {
    ace, n2, n3, n4, n5, n6, n7, n8, n9, n10, jack, knight, queen, king
};

const SuitKeys: Suit[] = getEnumKeys<Suit>(Suit);
const RankKeys: Rank[] = getEnumKeys<Rank>(Rank);

function suitToString(suit: Suit) {
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

function suitToSymbol(suit: Suit) {
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

function suitToInt(suit: Suit) {
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

function rankToString(rank: Rank) {
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

function rankToInt(rank: Rank) {
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

function rankToShortString(rank: Rank) {
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

function toSymbol(suit: Suit, rank: Rank) {
    let firstChar = 0xD83C;
    let secondChar = 
        0xDC00 +
        suitToInt(suit) * 0x10 +
        rankToInt(rank);

    return String.fromCharCode(firstChar, secondChar);
}

export {
    Suit, SuitKeys, suitToString, suitToSymbol, suitToInt,
    Rank, RankKeys, rankToString, rankToShortString, rankToInt,
    toSymbol
};