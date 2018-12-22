"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PluginManager {
    constructor(botHooks) {
        this.botHooks = botHooks;
        this.plugins = [];
    }
    register(plugin) {
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
