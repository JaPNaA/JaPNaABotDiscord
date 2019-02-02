import BotHooks from "../../bot/botHooks";
import BotPlugin from "../plugin";
import Logger from "../../../utils/logger";

class PluginManager {
    botHooks: BotHooks;
    plugins: BotPlugin[];

    constructor(botHooks: BotHooks) {
        this.botHooks = botHooks;
        this.plugins = [];
    }

    register(plugin: BotPlugin): void {
        if (this.botHooks.config.debugMode) {
            Logger.log("Refusing to load plugin in debug mode");
            return;
        }

        this.plugins.push(plugin);
        plugin._start();
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