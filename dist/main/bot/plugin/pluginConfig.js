"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const locationKeyCreator_1 = __importDefault(require("../utils/locationKeyCreator"));
class PluginConfig {
    plugin;
    bot;
    userSchema = {};
    constructor(plugin, bot) {
        this.plugin = plugin;
        this.bot = bot;
    }
    getInServer(serverId, key) {
        const localConfig = this.bot.memory.get(this.plugin.pluginName, "local." + locationKeyCreator_1.default.server(serverId));
        return localConfig[key] || this.get(key);
    }
    setInServer(serverId, key, value) {
        const conf = this.bot.memory.get(this.plugin.pluginName, "local." + locationKeyCreator_1.default.server(serverId));
        conf[key] = value;
        this.bot.memory.write(this.plugin.pluginName, "local." + locationKeyCreator_1.default.server(serverId), conf);
    }
    async getInChannel(channelId, key) {
        const server = await this.bot.client.getServerFromChannel(channelId);
        if (!server) {
            throw new Error("Channel or server not found");
        }
        const channelConfig = this.bot.memory.get(this.plugin.pluginName, "local." + locationKeyCreator_1.default.channel(server.id, channelId));
        const serverConfig = this.bot.memory.get(this.plugin.pluginName, "local." + locationKeyCreator_1.default.server(server.id));
        return channelConfig[key] || serverConfig[key] || this.get(key);
    }
    async setInChannel(channelId, key, value) {
        const server = await this.bot.client.getServerFromChannel(channelId);
        if (!server) {
            throw new Error("Channel or server not found");
        }
        const conf = this.bot.memory.get(this.plugin.pluginName, "local." + locationKeyCreator_1.default.channel(server.id, channelId));
        conf[key] = value;
        this.bot.memory.write(this.plugin.pluginName, "local." + locationKeyCreator_1.default.channel(server.id, channelId), conf);
    }
    get(key) {
        const all = this.getAll();
        return all && all[key];
    }
    getAll() {
        return this.bot.config.getPlugin(this.plugin.pluginName);
    }
}
exports.default = PluginConfig;
