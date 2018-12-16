/**
 * @typedef {import("./botMemory.js")} Memory
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
     * @returns {String} permissions namespace
     */
    permissions() {
        return this.strings.permissionsNamespace;
    }

    /**
     * @returns {String} location of first admin ID
     */
    firstAdmin() {
        return this.strings.permissionsAdmin;
    }

    /**
     * @returns {String} delimiter used for memory
     */
    delimiter() {
        return this.strings.memoryDelimiter;
    }

    /**
     * Creates the global key
     */
    global() {
        return this.strings.permissionsGlobal;
    }

    /**
     * Creates the key for server
     * @param {String} serverId id of server
     */
    server(serverId) {
        return serverId;
    }

    /**
     * Create the key for channel
     * @param {String} serverId id of server
     * @param {String} channelId id of channel
     */
    channel(serverId, channelId) {
        return serverId + this.strings.memoryDelimiter + channelId;
    }

    /**
     * Creates the location key
     * @param {String} userId id of user
     */
    user_global(userId) {
        return this.strings.permissionsGlobal + this.strings.memoryDelimiter + userId;
    }

    /**
     * Creates the location key
     * @param {String} serverId id of server
     * @param {String} userId id of user
     */
    user_server(serverId, userId) {
        return serverId + this.strings.memoryDelimiter + userId;
    }

    /**
     * Creates the location key
     * @param {String} serverId id of user
     * @param {String} userId id of user
     * @param {String} channelId id of channel
     */
    user_channel(serverId, userId, channelId) {
        return serverId + this.strings.memoryDelimiter + userId + this.strings.memoryDelimiter + channelId;
    }

    /**
     * Creates the location key
     * @param {String} roleId id of user
     */
    role_global(roleId) {
        return this.strings.permissionsGlobal + this.strings.memoryDelimiter + roleId;
    }

    /**
     * Creates the location key
     * @param {String} serverId id of server
     * @param {String} roleId id of user
     */
    role_server(serverId, roleId) {
        return serverId + this.strings.memoryDelimiter + roleId;
    }

    /**
     * Creates the location key
     * @param {String} serverId id of user
     * @param {String} roleId id of user
     * @param {String} channelId id of channel
     */
    role_channel(serverId, roleId, channelId) {
        return serverId + this.strings.memoryDelimiter + roleId + this.strings.memoryDelimiter + channelId;
    }

    /**
     * Creates the location key
     * @param {String} pluginName name of plugin
     */
    plugin(pluginName) {
        return "plugin" + this.strings.memoryDelimiter + pluginName;
    }

    /**
     * Creates the location key
     * @param {String} groupName name of group of plugins
     */
    pluginGroup(groupName) {
        return groupName;
    }
}

module.exports = MemoryLocationKeyCreator;