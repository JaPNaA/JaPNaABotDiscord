"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cardList_1 = __importDefault(require("./cardList"));
class CardSet extends cardList_1.default {
    constructor(cards) {
        super(cards);
    }
    toStrings() {
        return this.cards.map(card => card.toString());
    }
    toShortStrings() {
        return this.cards.map(card => card.toShortString());
    }
    toSymbols() {
        return this.cards.map(card => card.toSymbol());
    }
    toShortMDs() {
        return this.cards.map(card => card.toShortMD());
    }
}
exports.default = CardSet;
