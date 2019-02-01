import BotHooks from "../../bot/botHooks";
import BotPlugin from "../plugin";
declare class PluginManager {
    botHooks: BotHooks;
    plugins: BotPlugin[];
    constructor(botHooks: BotHooks);
    register(plugin: BotPlugin): void;
    unregisterAllPlugins(): void;
}
export default PluginManager;
