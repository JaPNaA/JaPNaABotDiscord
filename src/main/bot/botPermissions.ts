import Permissions from "../permissions.js";
import createKey from "./locationKeyCreator.js";
import Memory from "./botMemory.js";
import BotHooks from "./botHooks.js";
import { TextChannel, Role, Guild, User, GuildMember } from "discord.js";

class BotPermissions {
    botHooks: BotHooks;
    memory: Memory;

    constructor(botHooks: BotHooks) {
        this.botHooks = botHooks;
        this.memory = this.botHooks.memory as Memory;
    }

    getPermissions_role_channel(roleId: string, serverId: string, channelId: string): Permissions {
        let role: Role | undefined = this.botHooks.getRole(roleId, serverId);

        if (!role) { return new Permissions(); }
        let permissions: Permissions = new Permissions(role.permissions);
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

    getPermissions_global(userId: string): Permissions {
        let permissions: Permissions = new Permissions();
        permissions.importCustomPermissions(
            this.memory.get(createKey.permissions(), createKey.user_global(userId))
        );
        return permissions;
    }

    getPermissions_channel(userId: string, serverId: string, channelId: string): Permissions {
        let server: Guild | undefined;
        let user: GuildMember | undefined;
        let roles: Role[] | undefined;
        let permissionsNum: number = 0;

        if (serverId) {
            server = this.botHooks.getServer(serverId);
            if (!server) { return new Permissions(); }
            user = server.members.get(userId);
            if (!user) { return new Permissions(); }

            roles = user.roles.array();

            let permissions: number = user.permissions.bitfield;

            permissionsNum |= permissions;
        }

        let permissions: Permissions = new Permissions(permissionsNum);
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

    editPermissions_user_channel(userId: string, channelId: string, permissionName: string, value: boolean): void {
        let channel: TextChannel = this.botHooks.getChannel(channelId) as TextChannel;
        let serverId: string = channel.guild.id;

        let customPerms: any = this.memory.get(createKey.permissions(),
            createKey.user_channel(serverId, userId, channelId)
        );

        let permissions: Permissions = new Permissions();
        permissions.importCustomPermissions(customPerms);
        permissions.writeCustomPermission(permissionName, value);

        customPerms = permissions.getCustomPermissions();
        let locationKey: string = createKey.user_channel(serverId, userId, channelId);
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

    editPermissions_user_server(userId: string, serverId: string, permissionName: string, value: boolean): void {
        let customPerms: any = this.memory.get(createKey.permissions(),
            createKey.user_server(serverId, userId)
        );

        let permissions: Permissions = new Permissions();
        permissions.importCustomPermissions(customPerms);
        permissions.writeCustomPermission(permissionName, value);

        customPerms = permissions.getCustomPermissions();
        let locationKey: string = createKey.user_server(serverId, userId);
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

    editPermissions_role_channel(roleId: string, channelId: string, permissionName: string, value: boolean): void {
        let channel: TextChannel = this.botHooks.getChannel(channelId) as TextChannel;
        let serverId: string = channel.guild.id;

        let customPerms: any = this.memory.get(createKey.permissions(),
            createKey.role_channel(serverId, roleId, channelId)
        );

        let permissions: Permissions = new Permissions();
        permissions.importCustomPermissions(customPerms);
        permissions.writeCustomPermission(permissionName, value);

        customPerms = permissions.getCustomPermissions();
        let locationKey: string = createKey.role_channel(serverId, roleId, channelId);
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

    editPermissions_role_server(roleId: string, serverId: string, permissionName: string, value: boolean): void {
        let customPerms: any = this.memory.get(createKey.permissions(),
            createKey.role_server(serverId, roleId)
        );

        let permissions: Permissions = new Permissions();
        permissions.importCustomPermissions(customPerms);
        permissions.writeCustomPermission(permissionName, value);

        customPerms = permissions.getCustomPermissions();
        let locationKey: string = createKey.role_server(serverId, roleId);
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

    editPermissions_user_global(userId: string, permissionName: string, value: boolean): void {
        let customPerms: any = this.memory.get(createKey.permissions(),
            createKey.user_global(userId)
        );

        let permissions: Permissions = new Permissions();
        permissions.importCustomPermissions(customPerms);
        permissions.writeCustomPermission(permissionName, value);

        customPerms = permissions.getCustomPermissions();
        let locationKey: string = createKey.user_global(userId);
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

export default BotPermissions;