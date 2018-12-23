declare enum Suit {
    spades = 0,
    clubs = 1,
    hearts = 2,
    diamonds = 3
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
    queen = 11,
    king = 12
}
declare const SuitKeys: Suit[];
declare const RankKeys: Rank[];
declare function suitToString(suit: Suit): "Clubs" | "Diamonds" | "Hearts" | "Spades";
declare function suitToSymbol(suit: Suit): "♣" | "♦" | "♥" | "♠";
declare function rankToString(rank: Rank): "Ace" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "Jack" | "Queen" | "King";
declare function rankToShortString(rank: Rank): "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "A" | "J" | "Q" | "K";
export { Suit, SuitKeys, suitToString, suitToSymbol, Rank, RankKeys, rankToString, rankToShortString };
