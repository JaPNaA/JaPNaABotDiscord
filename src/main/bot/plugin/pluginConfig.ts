import { JSONObject, JSONType } from "../../types/jsonObject";
import Bot from "../bot/bot";
import locationKeyCreator from "../utils/locationKeyCreator";
import BotPlugin from "./plugin";

export default class PluginConfig {
    protected userSchema: {
        [x: string]: {
            type: string,
            comment: string
        }
    } = {};

    constructor(private plugin: BotPlugin, private bot: Bot) { }

    public getInServer(serverId: string, key: string) {
        const localConfig = this.bot.memory.get(this.plugin.pluginName, "local." + locationKeyCreator.server(serverId));
        return localConfig[key] || this.get(key);
    }

    public setInServer(serverId: string, key: string, value: JSONType) {
        const conf = this.bot.memory.get(this.plugin.pluginName, "local." + locationKeyCreator.server(serverId));
        conf[key] = value;
        this.bot.memory.write(this.plugin.pluginName, "local." + locationKeyCreator.server(serverId), conf);
    }

    public async getInChannel(channelId: string, key: string) {
        const server = await this.bot.client.getServerFromChannel(channelId);
        if (!server) { throw new Error("Channel or server not found"); }

        const channelConfig = this.bot.memory.get(this.plugin.pluginName, "local." + locationKeyCreator.channel(server.id, channelId));
        const serverConfig = this.bot.memory.get(this.plugin.pluginName, "local." + locationKeyCreator.server(server.id));
        return channelConfig[key] || serverConfig[key] || this.get(key);
    }

    public async setInChannel(channelId: string, key: string, value: JSONType) {
        const server = await this.bot.client.getServerFromChannel(channelId);
        if (!server) { throw new Error("Channel or server not found"); }

        const conf = this.bot.memory.get(this.plugin.pluginName, "local." + locationKeyCreator.channel(server.id, channelId));
        conf[key] = value;
        this.bot.memory.write(this.plugin.pluginName, "local." + locationKeyCreator.channel(server.id, channelId), conf);
    }

    public get(key: string) {
        const all = this.getAll() as JSONObject;
        return all && all[key];
    }

    public getAll() {
        return this.bot.config.getPlugin(this.plugin.pluginName);
    }
}
