declare class Permissions {
    [x: string]: any;
    num: number;
    CREATE_INSTANT_INVITE: boolean;
    KICK_MEMBERS: boolean;
    BAN_MEMBERS: boolean;
    ADMINISTRATOR: boolean;
    MANAGE_CHANNELS: boolean;
    MANAGE_GUILD: boolean;
    ADD_REACTIONS: boolean;
    VIEW_AUDIT_LOG: boolean;
    VIEW_CHANNEL: boolean;
    SEND_MESSAGES: boolean;
    SEND_TTS_MESSAGES: boolean;
    MANAGE_MESSAGES: boolean;
    EMBED_LINKS: boolean;
    ATTACH_FILES: boolean;
    READ_MESSAGE_HISTORY: boolean;
    MENTION_EVERYONE: boolean;
    USE_EXTERNAL_EMOJIS: boolean;
    CONNECT: boolean;
    SPEAK: boolean;
    MUTE_MEMBERS: boolean;
    DEAFEN_MEMBERS: boolean;
    MOVE_MEMBERS: boolean;
    USE_VAD: boolean;
    PRIORITY_SPEAKER: boolean;
    CHANGE_NICKNAME: boolean;
    MANAGE_NICKNAMES: boolean;
    MANAGE_ROLES: boolean;
    MANAGE_WEBHOOKS: boolean;
    MANAGE_EMOJIS: boolean;
    customPermissions: {
        [x: string]: boolean;
    };
    static keys: any;
    static specialCustoms: string[];
    /**
     * Permissions Constructor
     * @param permissionsNumber permission number
     * @param extendsPermissions extends other permissions
     */
    constructor(permissionsNumber?: number, extendsPermissions?: Permissions);
    /**
     * Sets all permissions to true
     */
    setAllPermissionsTrue(): void;
    /**
     * Check if has permission
     * @param {String} permission string
     * @returns {Boolean} has permission?
     */
    has(permission: string): boolean;
    /**
     * Converts capital to lowercase, replace underscores with spaces
     * @param {String} str input string
     * @returns {String} readable string
     */
    toReadable(str: string): string;
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
    getCustomPermissions(): string[];
    /**
     * Imports custom permissions
     * @param {String[]} keys custom permissions
     */
    importCustomPermissions(keys: string[]): void;
    /**
     * Writes a custom permission
     * @param {String} permission permission to write
     * @param {Boolean} value value of permission
     */
    customWrite(permission: string, value: boolean): void;
}
export default Permissions;
