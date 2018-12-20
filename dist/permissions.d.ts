declare const getBit: any;
declare class Permissions {
    /**
     * Permissions Constructor
     * @param {Number} [permissionsNumber=0] permission number
     * @param {Permissions} [extendsPermissions] extends other permissions
     */
    constructor(permissionsNumber: any, extendsPermissions: any);
    /**
     * Sets all permissions to true
     */
    setAllPermissions(): void;
    /**
     * Check if has permission
     * @param {String} permission string
     * @returns {Boolean} has permission?
     */
    has(permission: any): any;
    /**
     * Converts capital to lowercase, replace underscores with spaces
     * @param {String} str input string
     * @returns {String} readable string
     */
    toReadable(str: any): any;
    /**
     * Converts this.* to markdown string, with true being bold
     * @returns {String}
     */
    discordPermToString(): string;
    /**
     * Converts this.customPermissions to markdown string, with true being bold
     * @returns {String}
     */
    customToString(): string;
    /**
     * Converts this to a markdown string, with true being bold
     * @returns {String}
     */
    toString(): string;
    /**
     * lists custom permissions has
     * @returns {String[]} custom permissions
     */
    getCustomPermissions(): {};
    /**
     * Imports custom permissions
     * @param {String[]} keys custom permissions
     */
    importCustomPermissions(keys: any): void;
    /**
     * Writes a custom permission
     * @param {String} permission permission to write
     * @param {Boolean} value value of permission
     */
    customWrite(permission: any, value: any): void;
}
