import { Permissions as DiscordJSPermissions, PermissionString } from "discord.js";
declare class Permissions {
    static specialCustoms: string[];
    customPermissionsSet: Set<string>;
    private discordPermissions;
    private hasAdmin;
    /**
     * Permissions Constructor
     * @param permissionsNumber permission number
     * @param extendsPermissions extends other permissions
     */
    constructor(discordJSPermissions?: DiscordJSPermissions, extendsPermissions?: Permissions);
    addPermissions(permissions: Permissions | DiscordJSPermissions): void;
    hasDiscord(permission: PermissionString): boolean;
    hasCustom(permission: string): boolean;
    /** Converts capital to lowercase, replace underscores with spaces */
    private toReadable;
    /** Gets a list of toReadable-ized discord permissions */
    private getDiscordPermissions;
    /**
     * Converts this.customPermissions to markdown string, with true being bold
     */
    customToString(): string;
    /** Converts this to a markdown string, with true being bold */
    toString(): string;
    getCustomPermissions(): string[];
    importCustomPermissions(keys: string[]): void;
    /** Writes a custom permission */
    writeCustomPermission(permission: string, value: boolean): void;
}
export default Permissions;
