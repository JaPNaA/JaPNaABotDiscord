"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const locationKeyCreator_1 = __importDefault(require("../utils/locationKeyCreator"));
class PluginConfig {
    plugin;
    bot;
    constructor(plugin, bot) {
        this.plugin = plugin;
        this.bot = bot;
    }
    getInServer(serverId, key) {
        const localConfig = this.bot.memory.get(this.plugin.pluginName, "local." + locationKeyCreator_1.default.server(serverId));
        return this.firstDefined(localConfig[key], this.get(key));
    }
    getAllUserSettingsInServer(serverId) {
        return this._getAllUserSettingsIn(key => this.getInServer(serverId, key));
    }
    setInServer(serverId, key, value) {
        const conf = this.bot.memory.get(this.plugin.pluginName, "local." + locationKeyCreator_1.default.server(serverId)) || {};
        conf[key] = value;
        this.bot.memory.write(this.plugin.pluginName, "local." + locationKeyCreator_1.default.server(serverId), conf);
    }
    async getInChannel(channelId, key) {
        const server = await this.bot.client.getServerFromChannel(channelId);
        let serverConfig;
        if (server) {
            serverConfig = this.bot.memory.get(this.plugin.pluginName, "local." + locationKeyCreator_1.default.server(server.id));
        }
        const channelConfig = this.bot.memory.get(this.plugin.pluginName, "local." + locationKeyCreator_1.default.channel(server ? server.id : locationKeyCreator_1.default.serverDM(), channelId));
        return this.firstDefined(channelConfig?.[key], serverConfig?.[key], this.get(key));
    }
    async getAllUserSettingsInChannel(channelId) {
        return this._getAllUserSettingsIn(async (key) => await this.getInChannel(channelId, key));
    }
    async setInChannel(channelId, key, value) {
        const server = await this.bot.client.getServerFromChannel(channelId);
        if (!server) {
            throw new Error("Channel or server not found");
        }
        const conf = this.bot.memory.get(this.plugin.pluginName, "local." + locationKeyCreator_1.default.channel(server.id, channelId)) || {};
        conf[key] = value;
        this.bot.memory.write(this.plugin.pluginName, "local." + locationKeyCreator_1.default.channel(server.id, channelId), conf);
    }
    get(key) {
        const all = this.getAll();
        return this.firstDefined(all?.[key], this.plugin.userConfigSchema[key]?.default);
    }
    getAllUserSettings() {
        return this._getAllUserSettingsIn(key => this.get(key));
    }
    getUserSettingType(key) {
        return this.plugin.userConfigSchema[key].type;
    }
    getAll() {
        return this.bot.config.getPlugin(this.plugin.pluginName);
    }
    async _getAllUserSettingsIn(getter) {
        const keys = Object.keys(this.plugin.userConfigSchema);
        const map = new Map();
        const promises = [];
        for (const key of keys) {
            promises.push(getter(key).then(value => map.set(key, value)));
        }
        await Promise.all(promises);
        return map;
    }
    firstDefined(...args) {
        for (const arg of args) {
            if (arg !== undefined) {
                return arg;
            }
        }
    }
}
exports.default = PluginConfig;
