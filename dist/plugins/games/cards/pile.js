"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cardSet_1 = __importDefault(require("./cardSet"));
const cardList_1 = __importDefault(require("./cardList"));
class Pile extends cardList_1.default {
    constructor() {
        super([]);
        this.sets = [];
    }
    add(setOrCard) {
        let set;
        if (setOrCard instanceof cardSet_1.default) {
            set = setOrCard;
        }
        else {
            set = new cardSet_1.default([setOrCard]);
        }
        this.cards.push(...set.cards);
        this.sets.push(set);
    }
    getTopSet() {
        return this.sets[this.sets.length - 1];
    }
}
exports.default = Pile;
