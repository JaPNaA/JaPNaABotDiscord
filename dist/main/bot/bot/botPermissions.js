"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permissions_js_1 = __importDefault(require("../../types/permissions.js"));
const locationKeyCreator_js_1 = __importDefault(require("../utils/locationKeyCreator.js"));
class BotPermissions {
    bot;
    memory;
    constructor(bot) {
        this.bot = bot;
        this.memory = bot.memory;
    }
    async getPermissions_role_channel(roleId, serverId, channelId) {
        const role = await this.bot.client.getRole(roleId, serverId);
        if (!role) {
            return new permissions_js_1.default();
        }
        let permissions = new permissions_js_1.default(role.permissions);
        if (channelId) {
            permissions.importCustomPermissions(this.memory.get(locationKeyCreator_js_1.default.permissions(), locationKeyCreator_js_1.default.role_channel(serverId, roleId, channelId)));
        }
        permissions.importCustomPermissions(this.memory.get(locationKeyCreator_js_1.default.permissions(), locationKeyCreator_js_1.default.role_server(serverId, roleId)));
        return permissions;
    }
    getPermissions_global(userId) {
        let permissions = new permissions_js_1.default();
        permissions.importCustomPermissions(this.memory.get(locationKeyCreator_js_1.default.permissions(), locationKeyCreator_js_1.default.user_global(userId)));
        return permissions;
    }
    async getPermissions_channel(userId, serverId, channelId) {
        let server;
        let user;
        let roles;
        const permissions = new permissions_js_1.default();
        if (serverId) {
            server = await this.bot.client.getServer(serverId);
            if (!server) {
                return new permissions_js_1.default();
            }
            user = await server.members.fetch(userId);
            if (!user) {
                return new permissions_js_1.default();
            }
            roles = Array.from(user.roles.cache.values());
            permissions.addPermissions(user.permissions);
        }
        permissions.importCustomPermissions(this.memory.get(locationKeyCreator_js_1.default.permissions(), locationKeyCreator_js_1.default.user_global(userId)));
        if (roles) {
            for (let role of roles) {
                permissions.importCustomPermissions((await this.getPermissions_role_channel(role.id, serverId, channelId)).getCustomPermissions());
            }
        }
        if (serverId) {
            permissions.importCustomPermissions(this.memory.get(locationKeyCreator_js_1.default.permissions(), locationKeyCreator_js_1.default.user_server(serverId, userId)));
        }
        if (channelId) {
            permissions.importCustomPermissions(this.memory.get(locationKeyCreator_js_1.default.permissions(), locationKeyCreator_js_1.default.user_channel(serverId, userId, channelId)));
        }
        return permissions;
    }
    async editPermissions_user_channel(userId, channelId, permissionName, value) {
        let channel = await this.bot.client.getChannel(channelId);
        let serverId = channel.guild.id;
        let customPerms = this.memory.get(locationKeyCreator_js_1.default.permissions(), locationKeyCreator_js_1.default.user_channel(serverId, userId, channelId));
        let permissions = new permissions_js_1.default();
        permissions.importCustomPermissions(customPerms);
        permissions.writeCustomPermission(permissionName, value);
        customPerms = permissions.getCustomPermissions();
        let locationKey = locationKeyCreator_js_1.default.user_channel(serverId, userId, channelId);
        if (customPerms.length) {
            this.memory.write(locationKeyCreator_js_1.default.permissions(), locationKey, customPerms, true);
        }
        else {
            this.memory.write(locationKeyCreator_js_1.default.permissions(), locationKey, undefined, true);
        }
    }
    editPermissions_user_server(userId, serverId, permissionName, value) {
        let customPerms = this.memory.get(locationKeyCreator_js_1.default.permissions(), locationKeyCreator_js_1.default.user_server(serverId, userId));
        let permissions = new permissions_js_1.default();
        permissions.importCustomPermissions(customPerms);
        permissions.writeCustomPermission(permissionName, value);
        customPerms = permissions.getCustomPermissions();
        let locationKey = locationKeyCreator_js_1.default.user_server(serverId, userId);
        if (customPerms.length) {
            this.memory.write(locationKeyCreator_js_1.default.permissions(), locationKey, customPerms, true);
        }
        else {
            this.memory.write(locationKeyCreator_js_1.default.permissions(), locationKey, undefined, true);
        }
    }
    async editPermissions_role_channel(roleId, channelId, permissionName, value) {
        let channel = await this.bot.client.getChannel(channelId);
        let serverId = channel.guild.id;
        let customPerms = this.memory.get(locationKeyCreator_js_1.default.permissions(), locationKeyCreator_js_1.default.role_channel(serverId, roleId, channelId));
        let permissions = new permissions_js_1.default();
        permissions.importCustomPermissions(customPerms);
        permissions.writeCustomPermission(permissionName, value);
        customPerms = permissions.getCustomPermissions();
        let locationKey = locationKeyCreator_js_1.default.role_channel(serverId, roleId, channelId);
        if (customPerms.length) {
            this.memory.write(locationKeyCreator_js_1.default.permissions(), locationKey, customPerms, true);
        }
        else {
            this.memory.write(locationKeyCreator_js_1.default.permissions(), locationKey, undefined, true);
        }
    }
    editPermissions_role_server(roleId, serverId, permissionName, value) {
        let customPerms = this.memory.get(locationKeyCreator_js_1.default.permissions(), locationKeyCreator_js_1.default.role_server(serverId, roleId));
        let permissions = new permissions_js_1.default();
        permissions.importCustomPermissions(customPerms);
        permissions.writeCustomPermission(permissionName, value);
        customPerms = permissions.getCustomPermissions();
        let locationKey = locationKeyCreator_js_1.default.role_server(serverId, roleId);
        if (customPerms.length) {
            this.memory.write(locationKeyCreator_js_1.default.permissions(), locationKey, customPerms, true);
        }
        else {
            this.memory.write(locationKeyCreator_js_1.default.permissions(), locationKey, undefined, true);
        }
    }
    editPermissions_user_global(userId, permissionName, value) {
        let customPerms = this.memory.get(locationKeyCreator_js_1.default.permissions(), locationKeyCreator_js_1.default.user_global(userId));
        let permissions = new permissions_js_1.default();
        permissions.importCustomPermissions(customPerms);
        permissions.writeCustomPermission(permissionName, value);
        customPerms = permissions.getCustomPermissions();
        let locationKey = locationKeyCreator_js_1.default.user_global(userId);
        if (customPerms.length) {
            this.memory.write(locationKeyCreator_js_1.default.permissions(), locationKey, customPerms, true);
        }
        else {
            this.memory.write(locationKeyCreator_js_1.default.permissions(), locationKey, undefined, true);
        }
    }
}
exports.default = BotPermissions;
