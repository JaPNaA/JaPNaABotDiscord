import Permissions from "../../types/permissions.js";
import createKey from "../utils/locationKeyCreator.js";
import Memory from "./botMemory.js";
import { TextChannel, Role, Guild, GuildMember } from "discord.js";
import Bot from "./bot.js";

class BotPermissions {
    memory: Memory;

    constructor(private bot: Bot) {
        this.memory = bot.memory;
    }

    async getPermissions_role_channel(roleId: string, serverId: string, channelId: string): Promise<Permissions> {
        const role = await this.bot.client.getRole(roleId, serverId);

        if (!role) { return new Permissions(); }
        let permissions: Permissions = new Permissions(role.permissions.bitfield);
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

    async getPermissions_channel(userId: string, serverId: string, channelId: string): Promise<Permissions> {
        let server: Guild | undefined;
        let user: GuildMember | undefined;
        let roles: Role[] | undefined;
        let permissionsNum: bigint = 0n;

        if (serverId) {
            server = await this.bot.client.getServer(serverId);
            if (!server) { return new Permissions(); }
            user = await server.members.fetch(userId);
            if (!user) { return new Permissions(); }

            roles = Array.from(user.roles.cache.values());

            let permissions: bigint = user.permissions.bitfield;

            permissionsNum |= permissions;
        }

        let permissions: Permissions = new Permissions(permissionsNum);
        permissions.importCustomPermissions(
            this.memory.get(createKey.permissions(), createKey.user_global(userId))
        );

        if (roles) {
            for (let role of roles) {
                permissions.importCustomPermissions(
                    (await this.getPermissions_role_channel(role.id, serverId, channelId)).getCustomPermissions()
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

    async editPermissions_user_channel(userId: string, channelId: string, permissionName: string, value: boolean) {
        let channel: TextChannel = await this.bot.client.getChannel(channelId) as TextChannel;
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

    async editPermissions_role_channel(roleId: string, channelId: string, permissionName: string, value: boolean) {
        let channel: TextChannel = await this.bot.client.getChannel(channelId) as TextChannel;
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