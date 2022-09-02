"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commandManager_1 = __importDefault(require("../../main/bot/command/manager/commandManager"));
const plugin_1 = __importDefault(require("../../main/bot/plugin/plugin"));
class Game extends plugin_1.default {
    parentPlugin;
    channelId;
    commandManager;
    _gamePluginName;
    gameName;
    gameEnded = false;
    constructor(bot, parentPlugin, channelId) {
        super(bot);
        this.parentPlugin = parentPlugin;
        this.channelId = channelId;
        this.commandManager = new commandManager_1.default(this.bot);
        this.gameName = this.constructor.name;
        this._gamePluginName = this.gameName.toLowerCase();
        this.pluginName = "game." + this._gamePluginName;
        this._registerUnknownCommandHandler(this.commandManager, this.unknownCommandHandler);
    }
    *unknownCommandHandler() {
        return "That command doesn't exist!\n" +
            "(You're playing " + this.gameName + ")";
    }
}
exports.default = Game;
