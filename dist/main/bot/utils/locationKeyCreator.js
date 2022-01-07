"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MemoryLocationKeyCreator {
    strings = {
        permissionsNamespace: "permissions",
        permissionsAdmin: "_admin",
        permissionsGlobal: "global",
        memoryDelimiter: ".",
        pluginNamespace: "plugin"
    };
    permissions() {
        return this.strings.permissionsNamespace;
    }
    firstAdmin() {
        return this.strings.permissionsAdmin;
    }
    delimiter() {
        return this.strings.memoryDelimiter;
    }
    global() {
        return this.strings.permissionsGlobal;
    }
    server(serverId) {
        return serverId;
    }
    channel(serverId, channelId) {
        return serverId + this.strings.memoryDelimiter + channelId;
    }
    user_global(userId) {
        return this.strings.permissionsGlobal + this.strings.memoryDelimiter + userId;
    }
    user_server(serverId, userId) {
        return serverId + this.strings.memoryDelimiter + userId;
    }
    user_channel(serverId, userId, channelId) {
        return serverId + this.strings.memoryDelimiter + userId + this.strings.memoryDelimiter + channelId;
    }
    role_global(roleId) {
        return this.strings.permissionsGlobal + this.strings.memoryDelimiter + roleId;
    }
    role_server(serverId, roleId) {
        return serverId + this.strings.memoryDelimiter + roleId;
    }
    role_channel(serverId, roleId, channelId) {
        return serverId + this.strings.memoryDelimiter + roleId + this.strings.memoryDelimiter + channelId;
    }
    plugin(pluginName) {
        return this.strings.pluginNamespace + this.strings.memoryDelimiter + pluginName;
    }
    pluginGroup(groupName) {
        return groupName;
    }
}
exports.default = new MemoryLocationKeyCreator();
