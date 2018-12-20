declare class MemoryLocationKeyCreator {
    constructor();
    /**
     * @returns {String} permissions namespace
     */
    permissions(): any;
    /**
     * @returns {String} location of first admin ID
     */
    firstAdmin(): any;
    /**
     * @returns {String} delimiter used for memory
     */
    delimiter(): any;
    /**
     * Creates the global key
     */
    global(): any;
    /**
     * Creates the key for server
     * @param {String} serverId id of server
     */
    server(serverId: any): any;
    /**
     * Create the key for channel
     * @param {String} serverId id of server
     * @param {String} channelId id of channel
     */
    channel(serverId: any, channelId: any): any;
    /**
     * Creates the location key
     * @param {String} userId id of user
     */
    user_global(userId: any): any;
    /**
     * Creates the location key
     * @param {String} serverId id of server
     * @param {String} userId id of user
     */
    user_server(serverId: any, userId: any): any;
    /**
     * Creates the location key
     * @param {String} serverId id of user
     * @param {String} userId id of user
     * @param {String} channelId id of channel
     */
    user_channel(serverId: any, userId: any, channelId: any): any;
    /**
     * Creates the location key
     * @param {String} roleId id of user
     */
    role_global(roleId: any): any;
    /**
     * Creates the location key
     * @param {String} serverId id of server
     * @param {String} roleId id of user
     */
    role_server(serverId: any, roleId: any): any;
    /**
     * Creates the location key
     * @param {String} serverId id of user
     * @param {String} roleId id of user
     * @param {String} channelId id of channel
     */
    role_channel(serverId: any, roleId: any, channelId: any): any;
    /**
     * Creates the location key
     * @param {String} pluginName name of plugin
     */
    plugin(pluginName: any): any;
    /**
     * Creates the location key
     * @param {String} groupName name of group of plugins
     */
    pluginGroup(groupName: any): any;
}
