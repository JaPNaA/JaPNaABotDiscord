/**
 * @typedef {import("./memory/memory.js")} Memory
 * @typedef {import("./botHooks.js")} BotHooks
 * @typedef {import("discord.js").TextChannel} TextChannel
 */

const Permissions = require("../permissions.js");

class BotPermissions {
    /**
     * @param {BotHooks} botHooks
     */
    constructor(botHooks) {
        this.botHooks = botHooks;
        this.memory = this.botHooks.memory;
    }

    /**
     * Gets the permissions of role
     * @param {String} roleId id of role
     * @param {String} serverId id of server
     * @param {String} [channelId] id of channel
     * @returns {Permissions} permissions of role
     */
    getPermissions_role_channel(roleId, serverId, channelId) {
        let role = this.botHooks.getRole(roleId, serverId);

        let permissions = new Permissions(role.permissions);
        if (channelId) {
            permissions.importCustomPermissions(
                this.memory.get(this.memory.createKey.permissions(),
                    this.memory.createKey.role_channel(serverId, roleId, channelId)
                ));
        }

        permissions.importCustomPermissions(
            this.memory.get(this.memory.createKey.permissions(),
                this.memory.createKey.role_server(serverId, roleId)
            ));

        return permissions;
    }

    /**
     * Gets the global permissions of user
     * @param {String} userId id of user
     */
    getPermissions_global(userId) {
        let permissions = new Permissions();
        permissions.importCustomPermissions(
            this.memory.get(this.memory.createKey.permissions(), this.memory.createKey.user_global(userId))
        );
        return permissions;
    }

    /**
     * Gets the permissions of user from userId in serverId
     * @param {String} userId id of user
     * @param {String} [serverId] id of server
     * @param {String} [channelId] if of channel
     */
    getPermissions_channel(userId, serverId, channelId) {
        let server, user, roles;
        let permissionsNum = 0;

        if (serverId) {
            server = this.botHooks.getServer(serverId);
            user = server.members.get(userId);
            roles = user.roles.array();

            let permissions = user.permissions.bitfield;

            permissionsNum |= permissions;
        }

        let permissions = new Permissions(permissionsNum);
        permissions.importCustomPermissions(
            this.memory.get(this.memory.createKey.permissions(), this.memory.createKey.user_global(userId))
        );

        if (roles) {
            for (let role of roles) {
                permissions.importCustomPermissions(
                    this.getPermissions_role_channel(role.id, serverId, channelId).getCustomPermissions()
                );
            }
        }

        if (serverId) {
            permissions.importCustomPermissions(
                this.memory.get(this.memory.createKey.permissions(), this.memory.createKey.user_server(serverId, userId))
            );
        }

        if (channelId) {
            permissions.importCustomPermissions(
                this.memory.get(this.memory.createKey.permissions(),
                    this.memory.createKey.user_channel(serverId, userId, channelId)
                )
            );
        }

        return permissions;
    }

    /**
     * Sets the permissions of user in a channel
     * @param {String} userId user
     * @param {String} channelId id of channel
     * @param {String} permissionName name of permission
     * @param {Boolean} value value of permission to write
     */
    editPermissions_user_channel(userId, channelId, permissionName, value) {
        /** @type { TextChannel } */
        // @ts-ignore
        let channel = this.botHooks.getChannel(channelId);
        let serverId = channel.guild.id;

        let customPerms = this.memory.get(this.memory.createKey.permissions(),
            this.memory.createKey.user_channel(serverId, userId, channelId)
        );

        let permissions = new Permissions();
        permissions.importCustomPermissions(customPerms);
        permissions.customWrite(permissionName, value);

        customPerms = permissions.getCustomPermissions();
        let locationKey = this.memory.createKey.user_channel(serverId, userId, channelId);
        if (customPerms.length) {
            this.memory.write(this.memory.createKey.permissions(),
                locationKey, customPerms, true
            );
        } else {
            this.memory.write(this.memory.createKey.permissions(),
                locationKey, undefined, true
            );
        }
    }

    /**
     * Sets the permissions of user in a server
     * @param {String} userId id of user
     * @param {String} serverId id of server
     * @param {String} permissionName name of permission
     * @param {Boolean} value value of permission to write
     */
    editPermissions_user_server(userId, serverId, permissionName, value) {
        let customPerms = this.memory.get(this.memory.createKey.permissions(),
            this.memory.createKey.user_server(serverId, userId)
        );

        let permissions = new Permissions();
        permissions.importCustomPermissions(customPerms);
        permissions.customWrite(permissionName, value);

        customPerms = permissions.getCustomPermissions();
        let locationKey = this.memory.createKey.user_server(serverId, userId);
        if (customPerms.length) {
            this.memory.write(this.memory.createKey.permissions(),
                locationKey, customPerms, true
            );
        } else {
            this.memory.write(this.memory.createKey.permissions(),
                locationKey, undefined, true
            );
        }
    }

    /**
     * Sets the permissions of user in a channel
     * @param {String} roleId user
     * @param {String} channelId id of channel
     * @param {String} permissionName name of permission
     * @param {Boolean} value value of permission to write
     */
    editPermissions_role_channel(roleId, channelId, permissionName, value) {
        /** @type { TextChannel } */
        // @ts-ignore
        let channel = this.botHooks.getChannel(channelId);
        let serverId = channel.guild.id;

        let customPerms = this.memory.get(this.memory.createKey.permissions(),
            this.memory.createKey.role_channel(serverId, roleId, channelId)
        );

        let permissions = new Permissions();
        permissions.importCustomPermissions(customPerms);
        permissions.customWrite(permissionName, value);

        customPerms = permissions.getCustomPermissions();
        let locationKey = this.memory.createKey.role_channel(serverId, roleId, channelId);
        if (customPerms.length) {
            this.memory.write(this.memory.createKey.permissions(),
                locationKey, customPerms, true
            );
        } else {
            this.memory.write(this.memory.createKey.permissions(),
                locationKey, undefined, true
            );
        }
    }

    /**
     * Sets the permissions of user in a server
     * @param {String} roleId id of user
     * @param {String} serverId id of server
     * @param {String} permissionName name of permission
     * @param {Boolean} value value of permission to write
     */
    editPermissions_role_server(roleId, serverId, permissionName, value) {
        let customPerms = this.memory.get(this.memory.createKey.permissions(),
            this.memory.createKey.role_server(serverId, roleId)
        );

        let permissions = new Permissions();
        permissions.importCustomPermissions(customPerms);
        permissions.customWrite(permissionName, value);

        customPerms = permissions.getCustomPermissions();
        let locationKey = this.memory.createKey.role_server(serverId, roleId);
        if (customPerms.length) {
            this.memory.write(this.memory.createKey.permissions(),
                locationKey, customPerms, true
            );
        } else {
            this.memory.write(this.memory.createKey.permissions(),
                locationKey, undefined, true
            );
        }
    }

    /**
     * Sets the permissions of user everywhere
     * @param {String} userId id of user
     * @param {String} permissionName name of permission
     * @param {Boolean} value of permission to write
     */
    editPermissions_user_global(userId, permissionName, value) {
        let customPerms = this.memory.get(this.memory.createKey.permissions(),
            this.memory.createKey.user_global(userId)
        );

        let permissions = new Permissions();
        permissions.importCustomPermissions(customPerms);
        permissions.customWrite(permissionName, value);

        customPerms = permissions.getCustomPermissions();
        let locationKey = this.memory.createKey.user_global(userId);
        if (customPerms.length) {
            this.memory.write(this.memory.createKey.permissions(),
                locationKey, customPerms, true
            );
        } else {
            this.memory.write(this.memory.createKey.permissions(),
                locationKey, undefined, true
            );
        }
    }
}

module.exports = BotPermissions;