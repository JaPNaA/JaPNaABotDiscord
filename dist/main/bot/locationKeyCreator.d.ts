declare class MemoryLocationKeyCreator {
    strings: {
        permissionsNamespace: string;
        permissionsAdmin: string;
        permissionsGlobal: string;
        memoryDelimiter: string;
        pluginNamespace: string;
    };
    permissions(): string;
    firstAdmin(): string;
    delimiter(): string;
    global(): string;
    server(serverId: string): string;
    channel(serverId: string, channelId: string): string;
    user_global(userId: string): string;
    user_server(serverId: string, userId: string): string;
    user_channel(serverId: string, userId: string, channelId: string): string;
    role_global(roleId: string): string;
    role_server(serverId: string, roleId: string): string;
    role_channel(serverId: string, roleId: string, channelId: string): string;
    plugin(pluginName: string): string;
    pluginGroup(groupName: string): string;
}
declare const _default: MemoryLocationKeyCreator;
export default _default;
