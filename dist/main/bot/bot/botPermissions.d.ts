import Permissions from "../../types/permissions.js";
import Memory from "./botMemory.js";
import BotHooks from "./botHooks.js";
declare class BotPermissions {
    botHooks: BotHooks;
    memory: Memory;
    constructor(botHooks: BotHooks);
    getPermissions_role_channel(roleId: string, serverId: string, channelId: string): Permissions;
    getPermissions_global(userId: string): Permissions;
    getPermissions_channel(userId: string, serverId: string, channelId: string): Permissions;
    editPermissions_user_channel(userId: string, channelId: string, permissionName: string, value: boolean): void;
    editPermissions_user_server(userId: string, serverId: string, permissionName: string, value: boolean): void;
    editPermissions_role_channel(roleId: string, channelId: string, permissionName: string, value: boolean): void;
    editPermissions_role_server(roleId: string, serverId: string, permissionName: string, value: boolean): void;
    editPermissions_user_global(userId: string, permissionName: string, value: boolean): void;
}
export default BotPermissions;
