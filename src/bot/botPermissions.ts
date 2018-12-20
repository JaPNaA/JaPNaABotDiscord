/**
 * @typedef {import("./botMemory.js")} Memory
 * @typedef {import("./botHooks.js")} BotHooks
 * @typedef {import("discord.js").TextChannel} TextChannel
 */

import Permissions from "../permissions.js"; 
import createKey from "./locationKeyCreator.js";
import Memory from "./botMemory.js";

class BotPermissions {
    botHooks: BotHooks;
    memory: Memory;

    constructor(botHooks: BotHooks) {
        this.botHooks = botHooks;
        this.memory = this.botHooks.memory;
    }

    getPermissions_role_channel(roleId: string, serverId: string, channelId: string): Permissions {
        let role = this.botHooks.getRole(roleId, serverId);

        let permissions = new Permissions(role.permissions);
        if (channelId) {
            permissions.importCustomPermissions(
                this.memory.get(createKey.permissions(),
                    createKey.role_channel(serverId, roleId, channelId)
                ));
        }

        permissions.importCustomPermissions(
            this.memory.get(createKey.permissions(),
                createKey.role_server(serverId, roleId)
            ));

        return permissions;
    }

    getPermissions_global(userId: string) {
        let permissions = new Permissions();
        permissions.importCustomPermissions(
            this.memory.get(createKey.permissions(), createKey.user_global(userId))
        );
        return permissions;
    }

    getPermissions_channel(userId: string, serverId: string, channelId: string) {
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
            this.memory.get(createKey.permissions(), createKey.user_global(userId))
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
                this.memory.get(createKey.permissions(), createKey.user_server(serverId, userId))
            );
        }

        if (channelId) {
            permissions.importCustomPermissions(
                this.memory.get(createKey.permissions(),
                    createKey.user_channel(serverId, userId, channelId)
                )
            );
        }

        return permissions;
    }

    editPermissions_user_channel(userId: string, channelId: string, permissionName: string, value: boolean) {
        /** @type { TextChannel } */
        // @ts-ignore
        let channel: TextChannel = this.botHooks.getChannel(channelId);
        let serverId = channel.guild.id;

        let customPerms = this.memory.get(createKey.permissions(),
            createKey.user_channel(serverId, userId, channelId)
        );

        let permissions = new Permissions();
        permissions.importCustomPermissions(customPerms);
        permissions.customWrite(permissionName, value);

        customPerms = permissions.getCustomPermissions();
        let locationKey = createKey.user_channel(serverId, userId, channelId);
        if (customPerms.length) {
            this.memory.write(createKey.permissions(),
                locationKey, customPerms, true
            );
        } else {
            this.memory.write(createKey.permissions(),
                locationKey, undefined, true
            );
        }
    }

    editPermissions_user_server(userId: string, serverId: string, permissionName: string, value: boolean) {
        let customPerms = this.memory.get(createKey.permissions(),
            createKey.user_server(serverId, userId)
        );

        let permissions = new Permissions();
        permissions.importCustomPermissions(customPerms);
        permissions.customWrite(permissionName, value);

        customPerms = permissions.getCustomPermissions();
        let locationKey = createKey.user_server(serverId, userId);
        if (customPerms.length) {
            this.memory.write(createKey.permissions(),
                locationKey, customPerms, true
            );
        } else {
            this.memory.write(createKey.permissions(),
                locationKey, undefined, true
            );
        }
    }

    editPermissions_role_channel(roleId: string, channelId: string, permissionName: string, value: boolean) {
        /** @type { TextChannel } */
        // @ts-ignore
        let channel: TextChannel = this.botHooks.getChannel(channelId);
        let serverId = channel.guild.id;

        let customPerms = this.memory.get(createKey.permissions(),
            createKey.role_channel(serverId, roleId, channelId)
        );

        let permissions = new Permissions();
        permissions.importCustomPermissions(customPerms);
        permissions.customWrite(permissionName, value);

        customPerms = permissions.getCustomPermissions();
        let locationKey = createKey.role_channel(serverId, roleId, channelId);
        if (customPerms.length) {
            this.memory.write(createKey.permissions(),
                locationKey, customPerms, true
            );
        } else {
            this.memory.write(createKey.permissions(),
                locationKey, undefined, true
            );
        }
    }

    editPermissions_role_server(roleId: string, serverId: string, permissionName: string, value: boolean) {
        let customPerms = this.memory.get(createKey.permissions(),
            createKey.role_server(serverId, roleId)
        );

        let permissions = new Permissions();
        permissions.importCustomPermissions(customPerms);
        permissions.customWrite(permissionName, value);

        customPerms = permissions.getCustomPermissions();
        let locationKey = createKey.role_server(serverId, roleId);
        if (customPerms.length) {
            this.memory.write(createKey.permissions(),
                locationKey, customPerms, true
            );
        } else {
            this.memory.write(createKey.permissions(),
                locationKey, undefined, true
            );
        }
    }

    editPermissions_user_global(userId: string, permissionName: string, value: boolean) {
        let customPerms = this.memory.get(createKey.permissions(),
            createKey.user_global(userId)
        );

        let permissions = new Permissions();
        permissions.importCustomPermissions(customPerms);
        permissions.customWrite(permissionName, value);

        customPerms = permissions.getCustomPermissions();
        let locationKey = createKey.user_global(userId);
        if (customPerms.length) {
            this.memory.write(createKey.permissions(),
                locationKey, customPerms, true
            );
        } else {
            this.memory.write(createKey.permissions(),
                locationKey, undefined, true
            );
        }
    }
}

module.exports = BotPermissions;