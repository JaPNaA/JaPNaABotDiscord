"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commandManager_1 = __importDefault(require("../../main/bot/command/manager/commandManager"));
const plugin_1 = __importDefault(require("../../main/bot/plugin/plugin"));
class Game extends plugin_1.default {
    constructor(botHooks) {
        super(botHooks);
        this.commandManager = new commandManager_1.default(this.bot);
        this._pluginName = "game." + this.constructor.name.toLowerCase();
    }
}
exports.default = Game;
