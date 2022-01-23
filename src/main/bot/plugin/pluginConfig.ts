import { JSONObject, JSONType } from "../../types/jsonObject";
import Bot from "../bot/bot";
import locationKeyCreator from "../utils/locationKeyCreator";
import BotPlugin from "./plugin";

export default class PluginConfig {
    constructor(private plugin: BotPlugin, private bot: Bot) { }

    public getInServer(serverId: string, key: string) {
        const localConfig = this.bot.memory.get(this.plugin.pluginName, "local." + locationKeyCreator.server(serverId));
        return this.firstDefined(localConfig[key], this.get(key));
    }

    public getAllUserSettingsInServer(serverId: string) {
        return this._getAllUserSettingsIn(key => this.getInServer(serverId, key));
    }

    public setInServer(serverId: string, key: string, value: JSONType) {
        const conf = this.bot.memory.get(this.plugin.pluginName, "local." + locationKeyCreator.server(serverId)) || {};
        conf[key] = value;
        this.bot.memory.write(this.plugin.pluginName, "local." + locationKeyCreator.server(serverId), conf);
    }

    public async getInChannel(channelId: string, key: string) {
        const server = await this.bot.client.getServerFromChannel(channelId);
        let serverConfig;
        if (server) {
            serverConfig = this.bot.memory.get(
                this.plugin.pluginName,
                "local." + locationKeyCreator.server(server.id)
            );
        }

        const channelConfig = this.bot.memory.get(
            this.plugin.pluginName,
            "local." + locationKeyCreator.channel(
                server ? server.id : locationKeyCreator.serverDM(),
                channelId
            )
        );

        return this.firstDefined(channelConfig?.[key], serverConfig?.[key], this.get(key));
    }

    public async getAllUserSettingsInChannel(channelId: string) {
        return this._getAllUserSettingsIn(async key => await this.getInChannel(channelId, key));
    }

    public async setInChannel(channelId: string, key: string, value: JSONType) {
        const server = await this.bot.client.getServerFromChannel(channelId);
        if (!server) { throw new Error("Channel or server not found"); }

        const conf = this.bot.memory.get(this.plugin.pluginName, "local." + locationKeyCreator.channel(server.id, channelId)) || {};
        conf[key] = value;
        this.bot.memory.write(this.plugin.pluginName, "local." + locationKeyCreator.channel(server.id, channelId), conf);
    }

    public get(key: string) {
        const all = this.getAll() as JSONObject;
        return this.firstDefined(all?.[key], this.plugin.userConfigSchema[key]?.default);
    }

    public getAllUserSettings() {
        return this._getAllUserSettingsIn(key => this.get(key));
    }

    public getUserSettingType(key: string) {
        return this.plugin.userConfigSchema[key].type;
    }

    public getAll() {
        return this.bot.config.getPlugin(this.plugin.pluginName);
    }

    private async _getAllUserSettingsIn(getter: (key: string) => Promise<any>) {
        const keys = Object.keys(this.plugin.userConfigSchema);
        const map: Map<string, any> = new Map();
        const promises = [];

        for (const key of keys) {
            promises.push(getter(key).then(value =>
                map.set(key, value)
            ));
        }

        await Promise.all(promises);

        return map;
    }

    private firstDefined<T>(...args: T[]): T | undefined {
        for (const arg of args) {
            if (arg !== undefined) { return arg; }
        }
    }
}
