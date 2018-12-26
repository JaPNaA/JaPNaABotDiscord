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
}
exports.default = CardSet;
