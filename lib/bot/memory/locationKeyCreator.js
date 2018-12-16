/**
 * @typedef {import("./memory.js")} Memory
 */

class MemoryLocationKeyCreator {
    /**
     * 
     * @param {Memory} memory 
     */
    constructor(memory) {
        this.memory = memory;

        this.strings = {
            permissionsNamespace: "permissions",
            permissionsAdmin: "_admin",
            permissionsGlobal: "global",
            memoryDelimiter: "."
        };
    }

    /**
     * Creates the global key
     */
    createLocationKey_global() {
        return this.strings.permissionsGlobal;
    }

    /**
     * Creates the key for server
     * @param {String} serverId id of server
     */
    createLocationKey_server(serverId) {
        return serverId;
    }

    /**
     * Create the key for channel
     * @param {String} serverId id of server
     * @param {String} channelId id of channel
     */
    createLocationKey_channel(serverId, channelId) {
        return serverId + this.strings.memoryDelimiter + channelId;
    }

    /**
     * Creates the location key
     * @param {String} userId id of user
     */
    createLocationKey_user_global(userId) {
        return this.strings.permissionsGlobal + this.strings.memoryDelimiter + userId;
    }

    /**
     * Creates the location key
     * @param {String} serverId id of server
     * @param {String} userId id of user
     */
    createLocationKey_user_server(serverId, userId) {
        return serverId + this.strings.memoryDelimiter + userId;
    }

    /**
     * Creates the location key
     * @param {String} serverId id of user
     * @param {String} userId id of user
     * @param {String} channelId id of channel
     */
    createLocationKey_user_channel(serverId, userId, channelId) {
        return serverId + this.strings.memoryDelimiter + userId + this.strings.memoryDelimiter + channelId;
    }

    /**
     * Creates the location key
     * @param {String} roleId id of user
     */
    createLocationKey_role_global(roleId) {
        return this.strings.permissionsGlobal + this.strings.memoryDelimiter + roleId;
    }

    /**
     * Creates the location key
     * @param {String} serverId id of server
     * @param {String} roleId id of user
     */
    createLocationKey_role_server(serverId, roleId) {
        return serverId + this.strings.memoryDelimiter + roleId;
    }

    /**
     * Creates the location key
     * @param {String} serverId id of user
     * @param {String} roleId id of user
     * @param {String} channelId id of channel
     */
    createLocationKey_role_channel(serverId, roleId, channelId) {
        return serverId + this.strings.memoryDelimiter + roleId + this.strings.memoryDelimiter + channelId;
    }

    /**
     * Creates the location key
     * @param {String} pluginName name of plugin
     */
    createLocationKey_plugin(pluginName) {
        return "plugin" + this.strings.memoryDelimiter + pluginName;
    }

    /**
     * Creates the location key
     * @param {String} groupName name of group of plugins
     */
    createLocationKey_pluginGroup(groupName) {
        return groupName;
    }
}

module.exports = MemoryLocationKeyCreator;