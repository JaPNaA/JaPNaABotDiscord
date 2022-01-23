import BotPlugin from "../plugin";
import Bot from "../../bot/bot";
declare class PluginManager {
    private bot;
    plugins: BotPlugin[];
    constructor(bot: Bot);
    register(plugin: BotPlugin): void;
    getPlugin(pluginName: string): BotPlugin | undefined;
    unregisterAllPlugins(): void;
}
export default PluginManager;
