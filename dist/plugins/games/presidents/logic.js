"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pile_1 = __importDefault(require("../cards/pile"));
class Logic {
    constructor(playerIds) {
        this.players = [];
        this.pile = new pile_1.default();
        this.init(playerIds);
    }
}
exports.default = Logic;
