import { JSONType } from "../../types/jsonObject";
import Bot from "../bot/bot";
import BotPlugin from "./plugin";
export default class PluginConfig {
    private plugin;
    private bot;
    constructor(plugin: BotPlugin, bot: Bot);
    getInServer(serverId: string, key: string): any;
    getAllUserSettingsInServer(serverId: string): Promise<Map<string, any>>;
    setInServer(serverId: string, key: string, value: JSONType): void;
    deleteInServer(serverId: string, key: string): void;
    getInChannel(channelId: string, key: string): Promise<any>;
    getAllUserSettingsInChannel(channelId: string): Promise<Map<string, any>>;
    setInChannel(channelId: string, key: string, value: JSONType): Promise<void>;
    deleteInChannel(channelId: string, key: string): Promise<void>;
    private modifiyLocalConfig;
    get(key: string): any;
    getAllUserSettings(): Promise<Map<string, any>>;
    getUserSettingType(key: string): string;
    getAll(): JSONType | undefined;
    private _getAllUserSettingsIn;
    private firstDefined;
}
