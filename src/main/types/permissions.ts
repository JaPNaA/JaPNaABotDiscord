import { PermissionsBitField as DiscordJSPermissions, PermissionsString } from "discord.js";

class Permissions {
    public static specialCustoms: string[] = [
        "BOT_ADMINISTRATOR"
    ];

    public customPermissionsSet = new Set<string>();
    private discordPermissions = new DiscordJSPermissions();
    private hasAdmin = false;

    /**
     * Permissions Constructor
     * @param permissionsNumber permission number
     * @param extendsPermissions extends other permissions
     */
    constructor(discordJSPermissions?: DiscordJSPermissions, extendsPermissions?: Permissions) {
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

    addPermissions(permissions: Permissions | DiscordJSPermissions) {
        if (permissions instanceof Permissions) {
            this.discordPermissions.bitfield |= permissions.discordPermissions.bitfield;
            for (const item of permissions.customPermissionsSet) {
                this.customPermissionsSet.add(item);
            }
        } else {
            this.discordPermissions.bitfield |= permissions.bitfield;
        }
    }

    hasDiscord(permission: PermissionsString): boolean {
        return this.hasAdmin || this.discordPermissions.has(permission);
    }

    hasCustom(permission: string): boolean {
        return this.customPermissionsSet.has(permission);
    }

    /** Converts capital to lowercase, replace underscores with spaces */
    private toReadable(str: string): string {
        return str.toLowerCase().replace(/_/g, " ");
    }

    /** Gets a list of toReadable-ized discord permissions */
    private getDiscordPermissions(): string[] {
        const arr = [];
        for (const item of this.discordPermissions) {
            arr.push(this.toReadable(item));
        }
        return arr;
    }

    /**
     * Converts this.customPermissions to markdown string, with true being bold
     */
    customToString(): string {
        let str: string[] = [];
        let keys: string[] = Object.keys(this.customPermissionsSet);
        for (const permission of this.customPermissionsSet) {
            str.push(this.toReadable(permission));
        }

        if (str.length) {
            return "Custom: " + str.join(", ");
        } else {
            return "Custom: none";
        }
    }

    /** Converts this to a markdown string, with true being bold */
    toString(): string {
        const discordPermissions = Array.from(this.getDiscordPermissions()).sort().join(", ") || "None";
        return discordPermissions + "\n" + this.customToString();
    }

    getCustomPermissions(): string[] {
        return Array.from(this.customPermissionsSet);
    }

    importCustomPermissions(keys: string[]): void {
        if (!keys) { return; }

        if (typeof keys === "string") { // jic someone still has old method
            keys = JSON.parse(keys);
        }

        for (const key of keys) {
            this.customPermissionsSet.add(key);
        }
    }

    /** Writes a custom permission */
    writeCustomPermission(permission: string, value: boolean): void {
        if (value) {
            this.customPermissionsSet.add(permission);
        } else {
            this.customPermissionsSet.delete(permission);
        }
    }
}

export default Permissions;