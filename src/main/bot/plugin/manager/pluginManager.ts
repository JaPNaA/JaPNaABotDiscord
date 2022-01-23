import BotPlugin from "../plugin";
import Logger from "../../../utils/logger";
import Bot from "../../bot/bot";

class PluginManager {
    plugins: BotPlugin[];

    constructor(private bot: Bot) {
        this.plugins = [];
    }

    register(plugin: BotPlugin): void {
        if (this.bot.config.debugMode) {
            Logger.log("Refusing to load plugin in debug mode");
            return;
        }

        this.plugins.push(plugin);
        plugin._start();
    }

    getPlugin(pluginName: string): BotPlugin | undefined {
        for (const plugin of this.plugins) {
            if (plugin.pluginName === pluginName) {
                return plugin;
            }
        }
    }

    unregisterAllPlugins(): void {
        for (let plugin of this.plugins) {
            plugin._stop();
        }

        this.plugins.length = 0;
        console.warn("Don't forget to unregister all commands and precommands too, future me!");
    }
}

export default PluginManager;