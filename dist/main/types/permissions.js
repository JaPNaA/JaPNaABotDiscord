"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
class Permissions {
    static specialCustoms = [
        "BOT_ADMINISTRATOR"
    ];
    customPermissionsSet = new Set();
    discordPermissions = new discord_js_1.PermissionsBitField();
    hasAdmin = false;
    /**
     * Permissions Constructor
     * @param permissionsNumber permission number
     * @param extendsPermissions extends other permissions
     */
    constructor(discordJSPermissions, extendsPermissions) {
        if (discordJSPermissions) {
            this.addPermissions(discordJSPermissions);
        }
        if (extendsPermissions) {
            this.addPermissions(extendsPermissions);
        }
        if (this.hasDiscord('Administrator')) {
            this.hasAdmin = true;
        }
        /** Custom Permissions */
        this.customPermissionsSet = new Set();
    }
    addPermissions(permissions) {
        if (permissions instanceof Permissions) {
            this.discordPermissions.bitfield |= permissions.discordPermissions.bitfield;
            for (const item of permissions.customPermissionsSet) {
                this.customPermissionsSet.add(item);
            }
        }
        else {
            this.discordPermissions.bitfield |= permissions.bitfield;
        }
    }
    hasDiscord(permission) {
        return this.hasAdmin || this.discordPermissions.has(permission);
    }
    hasCustom(permission) {
        return this.customPermissionsSet.has(permission);
    }
    /** Converts capital to lowercase, replace underscores with spaces */
    toReadable(str) {
        return str.toLowerCase().replace(/_/g, " ");
    }
    /** Gets a list of toReadable-ized discord permissions */
    getDiscordPermissions() {
        const arr = [];
        for (const item of this.discordPermissions) {
            arr.push(this.toReadable(item));
        }
        return arr;
    }
    /**
     * Converts this.customPermissions to markdown string, with true being bold
     */
    customToString() {
        let str = [];
        let keys = Object.keys(this.customPermissionsSet);
        for (const permission of this.customPermissionsSet) {
            str.push(this.toReadable(permission));
        }
        if (str.length) {
            return "Custom: " + str.join(", ");
        }
        else {
            return "Custom: none";
        }
    }
    /** Converts this to a markdown string, with true being bold */
    toString() {
        const discordPermissions = Array.from(this.getDiscordPermissions()).sort().join(", ") || "None";
        return discordPermissions + "\n" + this.customToString();
    }
    getCustomPermissions() {
        return Array.from(this.customPermissionsSet);
    }
    importCustomPermissions(keys) {
        if (!keys) {
            return;
        }
        if (typeof keys === "string") { // jic someone still has old method
            keys = JSON.parse(keys);
        }
        for (const key of keys) {
            this.customPermissionsSet.add(key);
        }
    }
    /** Writes a custom permission */
    writeCustomPermission(permission, value) {
        if (value) {
            this.customPermissionsSet.add(permission);
        }
        else {
            this.customPermissionsSet.delete(permission);
        }
    }
}
exports.default = Permissions;
