import BotHooks from "../../botHooks";
import BotPlugin from "../plugin";

class PluginManager {
    botHooks: BotHooks;
    plugins: BotPlugin[];

    constructor(botHooks: BotHooks) {
        this.botHooks = botHooks;
        this.plugins = [];
    }

    register(plugin: BotPlugin): void {
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