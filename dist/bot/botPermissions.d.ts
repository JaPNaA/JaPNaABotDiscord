/**
 * @typedef {import("./botMemory.js")} Memory
 * @typedef {import("./botHooks.js")} BotHooks
 * @typedef {import("discord.js").TextChannel} TextChannel
 */
declare const Permissions: any;
declare const createKey: any;
declare class BotPermissions {
    /**
     * @param {BotHooks} botHooks
     */
    constructor(botHooks: any);
    /**
     * Gets the permissions of role
     * @param {String} roleId id of role
     * @param {String} serverId id of server
     * @param {String} [channelId] id of channel
     * @returns {Permissions} permissions of role
     */
    getPermissions_role_channel(roleId: any, serverId: any, channelId: any): any;
    /**
     * Gets the global permissions of user
     * @param {String} userId id of user
     */
    getPermissions_global(userId: any): any;
    /**
     * Gets the permissions of user from userId in serverId
     * @param {String} userId id of user
     * @param {String} [serverId] id of server
     * @param {String} [channelId] if of channel
     */
    getPermissions_channel(userId: any, serverId: any, channelId: any): any;
    /**
     * Sets the permissions of user in a channel
     * @param {String} userId user
     * @param {String} channelId id of channel
     * @param {String} permissionName name of permission
     * @param {Boolean} value value of permission to write
     */
    editPermissions_user_channel(userId: any, channelId: any, permissionName: any, value: any): void;
    /**
     * Sets the permissions of user in a server
     * @param {String} userId id of user
     * @param {String} serverId id of server
     * @param {String} permissionName name of permission
     * @param {Boolean} value value of permission to write
     */
    editPermissions_user_server(userId: any, serverId: any, permissionName: any, value: any): void;
    /**
     * Sets the permissions of user in a channel
     * @param {String} roleId user
     * @param {String} channelId id of channel
     * @param {String} permissionName name of permission
     * @param {Boolean} value value of permission to write
     */
    editPermissions_role_channel(roleId: any, channelId: any, permissionName: any, value: any): void;
    /**
     * Sets the permissions of user in a server
     * @param {String} roleId id of user
     * @param {String} serverId id of server
     * @param {String} permissionName name of permission
     * @param {Boolean} value value of permission to write
     */
    editPermissions_role_server(roleId: any, serverId: any, permissionName: any, value: any): void;
    /**
     * Sets the permissions of user everywhere
     * @param {String} userId id of user
     * @param {String} permissionName name of permission
     * @param {Boolean} value of permission to write
     */
    editPermissions_user_global(userId: any, permissionName: any, value: any): void;
}
