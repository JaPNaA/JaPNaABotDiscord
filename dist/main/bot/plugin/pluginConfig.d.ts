import { JSONType } from "../../types/jsonObject";
import Bot from "../bot/bot";
import BotPlugin from "./plugin";
export default class PluginConfig {
    private plugin;
    private bot;
    protected userSchema: {
        [x: string]: {
            type: string;
            comment: string;
        };
    };
    constructor(plugin: BotPlugin, bot: Bot);
    getInServer(serverId: string, key: string): any;
    setInServer(serverId: string, key: string, value: JSONType): void;
    getInChannel(channelId: string, key: string): Promise<any>;
    setInChannel(channelId: string, key: string, value: JSONType): Promise<void>;
    get(key: string): JSONType;
    getAll(): JSONType | undefined;
}
