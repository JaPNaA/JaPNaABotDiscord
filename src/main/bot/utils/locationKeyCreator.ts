class MemoryLocationKeyCreator {
    strings = {
        permissionsNamespace: "permissions",
        permissionsAdmin: "_admin",
        permissionsGlobal: "global",
        memoryDelimiter: ".",
        pluginNamespace: "plugin"
    };

    permissions(): string {
        return this.strings.permissionsNamespace;
    }

    firstAdmin(): string {
        return this.strings.permissionsAdmin;
    }

    delimiter(): string {
        return this.strings.memoryDelimiter;
    }

    global(): string {
        return this.strings.permissionsGlobal;
    }

    server(serverId: string): string {
        return serverId;
    }

    channel(serverId: string, channelId: string): string {
        return serverId + this.strings.memoryDelimiter + channelId;
    }

    user_global(userId: string): string {
        return this.strings.permissionsGlobal + this.strings.memoryDelimiter + userId;
    }

    user_server(serverId: string, userId: string): string {
        return serverId + this.strings.memoryDelimiter + userId;
    }

    user_channel(serverId: string, userId: string, channelId: string): string {
        return serverId + this.strings.memoryDelimiter + userId + this.strings.memoryDelimiter + channelId;
    }

    role_global(roleId: string): string {
        return this.strings.permissionsGlobal + this.strings.memoryDelimiter + roleId;
    }

    role_server(serverId: string, roleId: string): string {
        return serverId + this.strings.memoryDelimiter + roleId;
    }

    role_channel(serverId: string, roleId: string, channelId: string): string {
        return serverId + this.strings.memoryDelimiter + roleId + this.strings.memoryDelimiter + channelId;
    }

    plugin(pluginName: string): string {
        return this.strings.pluginNamespace + this.strings.memoryDelimiter + pluginName;
    }

    pluginGroup(groupName: string): string {
        return groupName;
    }
}

export default new MemoryLocationKeyCreator();