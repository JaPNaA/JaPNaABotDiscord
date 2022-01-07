"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../../../utils/logger"));
class PluginManager {
    bot;
    plugins;
    constructor(bot) {
        this.bot = bot;
        this.plugins = [];
    }
    register(plugin) {
        if (this.bot.config.debugMode) {
            logger_1.default.log("Refusing to load plugin in debug mode");
            return;
        }
        this.plugins.push(plugin);
        plugin._start();
    }
    unregisterAllPlugins() {
        for (let plugin of this.plugins) {
            plugin._stop();
        }
        this.plugins.length = 0;
        console.warn("Don't forget to unregister all commands and precommands too, future me!");
    }
}
exports.default = PluginManager;
