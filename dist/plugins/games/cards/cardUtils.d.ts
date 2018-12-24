declare enum Suit {
    spades = 0,
    hearts = 1,
    diamonds = 2,
    clubs = 3
}
declare enum Rank {
    ace = 0,
    n2 = 1,
    n3 = 2,
    n4 = 3,
    n5 = 4,
    n6 = 5,
    n7 = 6,
    n8 = 7,
    n9 = 8,
    n10 = 9,
    jack = 10,
    knight = 11,
    queen = 12,
    king = 13
}
declare const SuitKeys: Suit[];
declare const RankKeys: Rank[];
declare function suitToString(suit: Suit): "Spades" | "Diamonds" | "Hearts" | "Clubs";
declare function suitToSymbol(suit: Suit): "♠" | "♦" | "♥" | "♣";
declare function suitToInt(suit: Suit): 10 | 11 | 12 | 13;
declare function rankToString(rank: Rank): "Ace" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "Jack" | "Knight" | "Queen" | "King";
declare function rankToInt(rank: Rank): 4 | 3 | 2 | 1 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;
declare function rankToShortString(rank: Rank): "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "A" | "J" | "C" | "Q" | "K";
declare function toSymbol(suit: Suit, rank: Rank): string;
export { Suit, SuitKeys, suitToString, suitToSymbol, suitToInt, Rank, RankKeys, rankToString, rankToShortString, rankToInt, toSymbol };
